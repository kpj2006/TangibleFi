"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PortfolioPerformance } from "../../hooks/use-portfolio-data";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface PerformanceChartProps {
  data: PortfolioPerformance[];
  loading?: boolean;
  className?: string;
}

export function PerformanceChart({ data, loading = false, className = "" }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const minValue = Math.min(...data.map(d => d.value));
    const maxValue = Math.max(...data.map(d => d.value));
    const range = maxValue - minValue;
    const padding = range * 0.1;

    return {
      points: data.map((point, index) => ({
        x: (index / (data.length - 1)) * 100,
        y: 100 - ((point.value - minValue + padding) / (range + 2 * padding)) * 100,
        value: point.value,
        change: point.change,
        changePercent: point.changePercent,
        period: point.period,
      })),
      minValue: minValue - padding,
      maxValue: maxValue + padding,
      isPositive: data[data.length - 1]?.value > data[0]?.value,
      totalChange: data.length > 1 ? data[data.length - 1].value - data[0].value : 0,
      totalChangePercent: data.length > 1 && data[0].value > 0 
        ? ((data[data.length - 1].value - data[0].value) / data[0].value) * 100 
        : 0,
    };
  }, [data]);

  const pathData = useMemo(() => {
    if (!chartData) return "";
    
    const points = chartData.points;
    if (points.length === 0) return "";

    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Create smooth curve using quadratic bezier curves
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      if (i === 1) {
        // First curve
        const cp1x = prev.x + (curr.x - prev.x) * 0.5;
        const cp1y = prev.y;
        path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
      } else if (i === points.length - 1) {
        // Last curve
        const cp1x = prev.x + (curr.x - prev.x) * 0.5;
        const cp1y = curr.y;
        path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
      } else {
        // Middle curves - smooth transition
        const cp1x = prev.x + (curr.x - prev.x) * 0.3;
        const cp1y = prev.y + (curr.y - prev.y) * 0.3;
        const cp2x = curr.x - (next.x - curr.x) * 0.3;
        const cp2y = curr.y - (next.y - curr.y) * 0.3;
        path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${curr.x} ${curr.y}`;
      }
    }
    
    return path;
  }, [chartData]);

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Portfolio Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse flex space-x-4 w-full">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.points.length === 0) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Portfolio Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No performance data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Portfolio Performance (30 Days)
        </CardTitle>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            {chartData.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              chartData.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(chartData.totalChange)}
            </span>
            <span className={`text-xs ${
              chartData.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              ({formatPercent(chartData.totalChangePercent)})
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full relative">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0"
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  stopColor={chartData.isPositive ? "#10b981" : "#ef4444"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={chartData.isPositive ? "#10b981" : "#ef4444"}
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            <g stroke="#e5e7eb" strokeWidth="0.1" opacity="0.5">
              {[20, 40, 60, 80].map(y => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} />
              ))}
              {[20, 40, 60, 80].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="100" />
              ))}
            </g>
            
            {/* Area fill */}
            <path
              d={`${pathData} L 100 100 L 0 100 Z`}
              fill={`url(#${gradientId})`}
            />
            
            {/* Main line */}
            <path
              d={pathData}
              fill="none"
              stroke={chartData.isPositive ? "#10b981" : "#ef4444"}
              strokeWidth="0.5"
              className="drop-shadow-sm"
            />
            
            {/* Data points */}
            {chartData.points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="0.3"
                fill={chartData.isPositive ? "#10b981" : "#ef4444"}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <title>
                  {`${point.period}: ${formatCurrency(point.value)} (${formatPercent(point.changePercent)})`}
                </title>
              </circle>
            ))}
          </svg>
          
          {/* Value labels */}
          <div className="absolute top-0 left-0 text-xs text-gray-500">
            {formatCurrency(chartData.maxValue)}
          </div>
          <div className="absolute bottom-0 left-0 text-xs text-gray-500">
            {formatCurrency(chartData.minValue)}
          </div>
          
          {/* Time labels */}
          <div className="absolute bottom-0 left-0 text-xs text-gray-500">
            30d ago
          </div>
          <div className="absolute bottom-0 right-0 text-xs text-gray-500">
            Today
          </div>
        </div>
        
        {/* Performance metrics */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-xs text-gray-500">Current Value</div>
            <div className="text-sm font-medium">
              {formatCurrency(chartData.points[chartData.points.length - 1]?.value || 0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Best Day</div>
            <div className="text-sm font-medium text-green-600">
              {formatPercent(Math.max(...chartData.points.map(p => p.changePercent)))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Worst Day</div>
            <div className="text-sm font-medium text-red-600">
              {formatPercent(Math.min(...chartData.points.map(p => p.changePercent)))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 