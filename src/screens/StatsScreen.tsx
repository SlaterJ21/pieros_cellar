// src/screens/StatsScreen.tsx
import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Dimensions
} from 'react-native';
import {
    Text,
    Card,
    SegmentedButtons,
    ActivityIndicator,
    Chip
} from 'react-native-paper';
import { useQuery } from '@apollo/client/react';
import { GET_WINE_STATS } from '@/graphql/queries/stats';
import { GET_WINES } from '@/graphql/queries/wines';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

type TimeFrame = 'all' | 'year' | 'month';

export default function StatsScreen() {
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('all');

    const { data: statsData, loading: statsLoading } = useQuery(GET_WINE_STATS);
    const { data: winesData, loading: winesLoading } = useQuery(GET_WINES, {
        variables: { take: 10000 },
    });

    const loading = statsLoading || winesLoading;

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#8B2E2E" />
                <Text style={styles.loadingText}>Loading statistics...</Text>
            </View>
        );
    }

    const stats = statsData?.wineStats;
    const wines = winesData?.wines || [];

    // Calculate additional statistics
    const averagePrice = wines.reduce((sum: number, wine: any) => {
        const price = wine.currentValue || wine.purchasePrice || 0;
        return sum + parseFloat(price);
    }, 0) / (wines.length || 1);

    const totalInvestment = wines.reduce((sum: number, wine: any) => {
        const price = wine.purchasePrice || 0;
        return sum + (parseFloat(price) * wine.quantity);
    }, 0);

    const currentYear = new Date().getFullYear();
    const winesByDecade = wines.reduce((acc: any, wine: any) => {
        if (wine.vintage) {
            const decade = Math.floor(wine.vintage / 10) * 10;
            acc[decade] = (acc[decade] || 0) + wine.quantity;
        }
        return acc;
    }, {});

    const topWineries = wines.reduce((acc: any, wine: any) => {
        const wineryName = wine.winery?.name || 'Unknown';
        if (!acc[wineryName]) {
            acc[wineryName] = { count: 0, value: 0 };
        }
        acc[wineryName].count += wine.quantity;
        const value = wine.currentValue || wine.purchasePrice || 0;
        acc[wineryName].value += parseFloat(value) * wine.quantity;
        return acc;
    }, {});

    const topWineriesArray = Object.entries(topWineries)
        .map(([name, data]: [string, any]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const mostExpensiveWines = [...wines]
        .sort((a: any, b: any) => {
            const priceA = parseFloat(a.currentValue || a.purchasePrice || 0);
            const priceB = parseFloat(b.currentValue || b.purchasePrice || 0);
            return priceB - priceA;
        })
        .slice(0, 5);

    // Prepare chart data
    const typeColors = ['#8B2E2ECC', '#FFD700CC', '#FF69B4CC', '#9370DBCC', '#20B2AACC', '#FF8C00CC', '#32CD32CC'];

    const pieChartData = stats?.byType.map((item: any, index: number) => ({
        name: item.type,
        population: item.count,
        color: typeColors[index % typeColors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
    })) || [];

    const countryChartData = {
        labels: stats?.byCountry.slice(0, 5).map((c: any) => c.country.substring(0, 3)) || [],
        datasets: [{
            data: stats?.byCountry.slice(0, 5).map((c: any) => c.count) || [0],
        }],
    };

    const StatCard = ({
                          icon,
                          title,
                          value,
                          subtitle,
                          color = '#8B2E2E'
                      }: {
        icon: string;
        title: string;
        value: string | number;
        subtitle?: string;
        color?: string;
    }) => (
        <View style={styles.statCard}>
            <View style={styles.statCardInner}>
                <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
                    <MaterialCommunityIcons name={icon as any} size={32} color={color} />
                </View>
                <View style={styles.statContent}>
                    <Text style={styles.statTitle}>{title}</Text>
                    <Text style={styles.statValue}>{value}</Text>
                    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
                </View>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header Stats */}
            <Text style={styles.pageTitle}>Cellar Statistics</Text>

            {/* Time Frame Filter */}
            <SegmentedButtons
                value={timeFrame}
                onValueChange={(value) => setTimeFrame(value as TimeFrame)}
                buttons={[
                    { value: 'all', label: 'All Time' },
                    { value: 'year', label: 'This Year' },
                    { value: 'month', label: 'This Month' },
                ]}
                style={styles.segmentedButtons}
            />

            {/* Key Metrics Grid */}
            <View style={styles.metricsGrid}>
                <StatCard
                    icon="bottle-wine"
                    title="Total Bottles"
                    value={stats?.totalBottles || 0}
                    color="#8B2E2E"
                />
                <StatCard
                    icon="currency-usd"
                    title="Total Value"
                    value={`$${stats?.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}`}
                    color="#4CAF50"
                />
                <StatCard
                    icon="check-circle"
                    title="Ready to Drink"
                    value={stats?.readyToDrink || 0}
                    subtitle={`${Math.round((stats?.readyToDrink / stats?.totalBottles) * 100 || 0)}% of collection`}
                    color="#FFD700"
                />
                <StatCard
                    icon="chart-line"
                    title="Avg. Bottle Value"
                    value={`$${averagePrice.toFixed(0)}`}
                    color="#2196F3"
                />
            </View>

            {/* Wine Types Distribution */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.cardTitle}>Collection by Type</Text>
                    {pieChartData.length > 0 ? (
                        <PieChart
                            data={pieChartData}
                            width={screenWidth - 64}
                            height={220}
                            chartConfig={{
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    ) : (
                        <Text style={styles.noData}>No data available</Text>
                    )}
                </Card.Content>
            </Card>

            {/* By Country */}
            {stats?.byCountry && stats.byCountry.length > 0 && (
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.cardTitle}>Top 5 Countries</Text>
                        <BarChart
                            data={countryChartData}
                            width={screenWidth - 64}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: '#fff',
                                backgroundGradientFrom: '#fff',
                                backgroundGradientTo: '#fff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(139, 46, 46, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                style: {
                                    borderRadius: 16,
                                },
                                propsForBackgroundLines: {
                                    strokeDasharray: '',
                                    stroke: '#e0e0e0',
                                },
                            }}
                            style={styles.chart}
                            showValuesOnTopOfBars
                            fromZero
                        />
                    </Card.Content>
                </Card>
            )}

            {/* Investment Overview */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.cardTitle}>Investment Overview</Text>
                    <View style={styles.investmentGrid}>
                        <View style={styles.investmentItem}>
                            <Text style={styles.investmentLabel}>Total Invested</Text>
                            <Text style={styles.investmentValue}>
                                ${totalInvestment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </Text>
                        </View>
                        <View style={styles.investmentItem}>
                            <Text style={styles.investmentLabel}>Current Value</Text>
                            <Text style={[styles.investmentValue, styles.investmentValueGreen]}>
                                ${stats?.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.investmentChange}>
                        {stats?.totalValue > totalInvestment ? (
                            <>
                                <MaterialCommunityIcons name="trending-up" size={24} color="#4CAF50" />
                                <Text style={styles.investmentGain}>
                                    +${(stats.totalValue - totalInvestment).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    ({(((stats.totalValue - totalInvestment) / totalInvestment) * 100).toFixed(1)}%)
                                </Text>
                            </>
                        ) : stats?.totalValue < totalInvestment ? (
                            <>
                                <MaterialCommunityIcons name="trending-down" size={24} color="#d32f2f" />
                                <Text style={styles.investmentLoss}>
                                    -${(totalInvestment - stats.totalValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    ({(((totalInvestment - stats.totalValue) / totalInvestment) * 100).toFixed(1)}%)
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.investmentNeutral}>No change</Text>
                        )}
                    </View>
                </Card.Content>
            </Card>

            {/* Top Wineries */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.cardTitle}>Top 5 Wineries</Text>
                    {topWineriesArray.map((winery, index) => (
                        <View key={winery.name} style={styles.listItem}>
                            <View style={styles.listItemLeft}>
                                <View style={[styles.rankBadge, index === 0 && styles.rankBadgeGold]}>
                                    <Text style={styles.rankText}>{index + 1}</Text>
                                </View>
                                <View>
                                    <Text style={styles.listItemTitle}>{winery.name}</Text>
                                    <Text style={styles.listItemSubtitle}>
                                        {winery.count} bottles • ${winery.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </Card.Content>
            </Card>

            {/* Vintages by Decade */}
            {Object.keys(winesByDecade).length > 0 && (
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.cardTitle}>Vintages by Decade</Text>
                        <View style={styles.decadeContainer}>
                            {Object.entries(winesByDecade)
                                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                                .map(([decade, count]: [string, any]) => (
                                    <Chip
                                        key={decade}
                                        style={styles.decadeChip}
                                        textStyle={styles.decadeChipText}
                                    >
                                        {decade}s: {count}
                                    </Chip>
                                ))}
                        </View>
                    </Card.Content>
                </Card>
            )}

            {/* Most Valuable Wines */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.cardTitle}>Most Valuable Wines</Text>
                    {mostExpensiveWines.map((wine: any, index) => {
                        const value = parseFloat(wine.currentValue || wine.purchasePrice || 0);
                        return (
                            <View key={wine.id} style={styles.listItem}>
                                <View style={styles.listItemLeft}>
                                    <View style={[styles.rankBadge, index === 0 && styles.rankBadgeGold]}>
                                        <Text style={styles.rankText}>{index + 1}</Text>
                                    </View>
                                    <View style={styles.wineInfo}>
                                        <Text style={styles.listItemTitle} numberOfLines={1}>
                                            {wine.name}
                                        </Text>
                                        <Text style={styles.listItemSubtitle} numberOfLines={1}>
                                            {wine.winery?.name} • {wine.vintage || 'NV'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.priceText}>${value.toFixed(0)}</Text>
                            </View>
                        );
                    })}
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.cardTitle}>Collection Insights</Text>
                    <View style={styles.insightItem}>
                        <MaterialCommunityIcons name="information" size={20} color="#2196F3" />
                        <Text style={styles.insightText}>
                            You have wines from {stats?.byCountry.length || 0} different countries
                        </Text>
                    </View>
                    <View style={styles.insightItem}>
                        <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
                        <Text style={styles.insightText}>
                            Your most collected type is {stats?.byType[0]?.type || 'N/A'} with {stats?.byType[0]?.count || 0} bottles
                        </Text>
                    </View>
                    <View style={styles.insightItem}>
                        <MaterialCommunityIcons name="calendar-check" size={20} color="#4CAF50" />
                        <Text style={styles.insightText}>
                            {stats?.readyToDrink || 0} wines are in their optimal drinking window
                        </Text>
                    </View>
                    {wines.filter((w: any) => w.drinkTo && w.drinkTo < currentYear).length > 0 && (
                        <View style={styles.insightItem}>
                            <MaterialCommunityIcons name="alert" size={20} color="#d32f2f" />
                            <Text style={styles.insightText}>
                                {wines.filter((w: any) => w.drinkTo && w.drinkTo < currentYear).length} wines may be past their peak
                            </Text>
                        </View>
                    )}
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
        fontSize: 16,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#2c2c2c',
        marginBottom: 16,
    },
    segmentedButtons: {
        marginBottom: 20,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
        marginBottom: 20,
    },
    statCard: {
        width: '50%',
        paddingHorizontal: 6,
        marginBottom: 12,
    },
    statCardInner: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statContent: {
        flex: 1,
    },
    statTitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2c2c2c',
    },
    statSubtitle: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    card: {
        backgroundColor: '#fff',
        marginBottom: 16,
        borderRadius: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2c2c2c',
        marginBottom: 16,
    },
    chart: {
        borderRadius: 16,
    },
    noData: {
        textAlign: 'center',
        color: '#666',
        padding: 40,
    },
    investmentGrid: {
        flexDirection: 'row',
        marginHorizontal: -8,
        marginBottom: 16,
    },
    investmentItem: {
        flex: 1,
        paddingHorizontal: 8,
    },
    investmentLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    investmentValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2c2c2c',
    },
    investmentValueGreen: {
        color: '#4CAF50',
    },
    investmentChange: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    investmentGain: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4CAF50',
        marginLeft: 8,
    },
    investmentLoss: {
        fontSize: 16,
        fontWeight: '600',
        color: '#d32f2f',
        marginLeft: 8,
    },
    investmentNeutral: {
        fontSize: 16,
        color: '#666',
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    listItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    rankBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankBadgeGold: {
        backgroundColor: '#FFD700',
    },
    rankText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2c2c2c',
    },
    wineInfo: {
        flex: 1,
    },
    listItemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2c2c2c',
        marginBottom: 2,
    },
    listItemSubtitle: {
        fontSize: 13,
        color: '#666',
    },
    priceText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4CAF50',
    },
    decadeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    decadeChip: {
        backgroundColor: '#8B2E2E',
        marginHorizontal: 4,
        marginVertical: 4,
    },
    decadeChipText: {
        color: '#fff',
        fontWeight: '600',
    },
    insightItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingRight: 12,
    },
    insightText: {
        flex: 1,
        fontSize: 14,
        color: '#2c2c2c',
        lineHeight: 20,
        marginLeft: 12,
    },
    bottomSpacer: {
        height: 20,
    },
});