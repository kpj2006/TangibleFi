"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/navbar";
import {
  Users,
  MessageSquare,
  Calendar,
  Trophy,
  Heart,
  Share2,
  ThumbsUp,
  Eye,
  Clock,
  MapPin,
  ExternalLink,
  Send,
  Star,
  Sparkles,
  TrendingUp,
  Zap,
  Home,
  Github,
  Twitter,
  Youtube,
  Mic,
  Award,
  Target,
  BookOpen,
  HelpCircle,
  Coffee,
  Gamepad2,
} from "lucide-react";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("discussions");
  const [newPost, setNewPost] = useState("");

  const communityStats = [
    {
      label: "Total Members",
      value: "12,543",
      icon: Users,
      change: "+1.2k this month",
    },
    {
      label: "Active Discussions",
      value: "2,847",
      icon: MessageSquare,
      change: "+284 this week",
    },
    {
      label: "Community Events",
      value: "47",
      icon: Calendar,
      change: "12 upcoming",
    },
    {
      label: "Expert Contributors",
      value: "156",
      icon: Award,
      change: "+23 verified",
    },
  ];

  const forumCategories = [
    {
      id: "general",
      name: "General Discussion",
      description: "General discussions about RWA tokenization",
      posts: 1247,
      members: 3892,
      icon: MessageSquare,
      color: "blue",
    },
    {
      id: "defi",
      name: "DeFi & Lending",
      description: "Asset-backed lending and DeFi protocols",
      posts: 892,
      members: 2156,
      icon: TrendingUp,
      color: "green",
    },
    {
      id: "tech",
      name: "Technical Support",
      description: "Get help with platform features and issues",
      posts: 634,
      members: 1847,
      icon: HelpCircle,
      color: "orange",
    },
    {
      id: "announcements",
      name: "Announcements",
      description: "Official updates and platform news",
      posts: 89,
      members: 8234,
      icon: Sparkles,
      color: "purple",
    },
  ];

  const recentDiscussions = [
    {
      id: 1,
      title: "Best practices for real estate tokenization",
      author: "Alex Chen",
      authorRole: "RWA Expert",
      category: "General Discussion",
      replies: 24,
      views: 1247,
      likes: 89,
      timeAgo: "2 hours ago",
      isPinned: true,
      tags: ["real-estate", "tokenization", "best-practices"],
    },
    {
      id: 2,
      title: "New cross-chain bridge integration announcement",
      author: "Sarah Johnson",
      authorRole: "Core Team",
      category: "Announcements",
      replies: 156,
      views: 4832,
      likes: 312,
      timeAgo: "4 hours ago",
      isPinned: true,
      tags: ["announcement", "cross-chain", "bridge"],
    },
    {
      id: 3,
      title: "How to optimize loan-to-value ratios?",
      author: "Michael Rivera",
      authorRole: "Community Member",
      category: "DeFi & Lending",
      replies: 18,
      views: 892,
      likes: 67,
      timeAgo: "6 hours ago",
      isPinned: false,
      tags: ["ltv", "optimization", "lending"],
    },
    {
      id: 4,
      title: "Wallet connection issues after latest update",
      author: "Emma Wilson",
      authorRole: "Community Member",
      category: "Technical Support",
      replies: 12,
      views: 456,
      likes: 23,
      timeAgo: "8 hours ago",
      isPinned: false,
      tags: ["wallet", "technical", "support"],
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "RWA Tokenization Webinar Series",
      description: "Learn advanced strategies for tokenizing real-world assets",
      date: "2025-02-15",
      time: "2:00 PM EST",
      type: "Webinar",
      attendees: 847,
      maxAttendees: 1000,
      speaker: "Dr. Amanda Foster",
      isRegistered: false,
    },
    {
      id: 2,
      title: "Community AMA with Core Team",
      description: "Ask anything about platform roadmap and upcoming features",
      date: "2025-02-20",
      time: "6:00 PM EST",
      type: "AMA",
      attendees: 623,
      maxAttendees: 500,
      speaker: "TangibleFi Team",
      isRegistered: true,
    },
    {
      id: 3,
      title: "DeFi Lending Best Practices Workshop",
      description: "Hands-on workshop for optimizing your lending strategies",
      date: "2025-02-25",
      time: "1:00 PM EST",
      type: "Workshop",
      attendees: 234,
      maxAttendees: 300,
      speaker: "James Martinez",
      isRegistered: false,
    },
  ];

  const topContributors = [
    {
      rank: 1,
      name: "Alex Chen",
      role: "RWA Expert",
      contributions: 342,
      reputation: 9847,
      badge: "Expert",
      avatar: "AC",
    },
    {
      rank: 2,
      name: "Sarah Johnson",
      role: "Core Team",
      contributions: 289,
      reputation: 8934,
      badge: "Team",
      avatar: "SJ",
    },
    {
      rank: 3,
      name: "Michael Rivera",
      role: "Community Leader",
      contributions: 256,
      reputation: 7823,
      badge: "Leader",
      avatar: "MR",
    },
    {
      rank: 4,
      name: "Emma Wilson",
      role: "Active Member",
      contributions: 198,
      reputation: 6542,
      badge: "Active",
      avatar: "EW",
    },
    {
      rank: 5,
      name: "David Kim",
      role: "DeFi Specialist",
      contributions: 167,
      reputation: 5891,
      badge: "Specialist",
      avatar: "DK",
    },
  ];

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Expert":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Team":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Leader":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Active":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Specialist":
        return "bg-cyan-100 text-cyan-800 border-cyan-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatTimeAgo = (timeAgo: string) => {
    return timeAgo;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              TangibleFi Community
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with fellow users, share knowledge, and stay updated with
              the latest in real-world asset tokenization
            </p>

            {/* Community Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
              {communityStats.map((stat, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <stat.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-xs text-emerald-600">
                          {stat.change}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <div className="flex items-center justify-center">
              <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white/80 backdrop-blur-sm shadow-lg">
                <TabsTrigger
                  value="discussions"
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Discussions
                </TabsTrigger>
                <TabsTrigger value="events" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Events
                </TabsTrigger>
                <TabsTrigger
                  value="leaderboard"
                  className="flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Resources
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="discussions" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Forum Categories */}
                <div className="space-y-6">
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        Forum Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {forumCategories.map((category) => (
                        <div
                          key={category.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 bg-${category.color}-100 rounded-lg flex items-center justify-center`}
                            >
                              <category.icon
                                className={`w-5 h-5 text-${category.color}-600`}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {category.name}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1">
                                {category.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>{category.posts} posts</span>
                                <span>{category.members} members</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Quick Actions
                      </h3>
                      <div className="space-y-2">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                          <Send className="w-4 h-4 mr-2" />
                          Start New Discussion
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-blue-300 text-blue-700"
                        >
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Ask for Help
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-purple-300 text-purple-700"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Share Achievement
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Discussions */}
                <div className="lg:col-span-3 space-y-6">
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          Recent Discussions
                        </span>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          New Post
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recentDiscussions.map((discussion) => (
                        <div
                          key={discussion.id}
                          className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {discussion.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    {discussion.isPinned && (
                                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                        <Star className="w-3 h-3 mr-1" />
                                        Pinned
                                      </Badge>
                                    )}
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {discussion.category}
                                    </Badge>
                                  </div>
                                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                    {discussion.title}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      {discussion.author}
                                    </span>
                                    <Badge
                                      className={getBadgeColor(
                                        discussion.authorRole.includes("Expert")
                                          ? "Expert"
                                          : discussion.authorRole.includes(
                                                "Team"
                                              )
                                            ? "Team"
                                            : discussion.authorRole.includes(
                                                  "Leader"
                                                )
                                              ? "Leader"
                                              : "Active"
                                      )}
                                    >
                                      {discussion.authorRole}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      •
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {formatTimeAgo(discussion.timeAgo)}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <MessageSquare className="w-4 h-4" />
                                    {discussion.replies}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    {discussion.views}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ThumbsUp className="w-4 h-4" />
                                    {discussion.likes}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-3">
                                {discussion.tags.map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs text-blue-600 border-blue-300"
                                  >
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Events */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Upcoming Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {upcomingEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  className={`${
                                    event.type === "Webinar"
                                      ? "bg-blue-100 text-blue-800"
                                      : event.type === "AMA"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-emerald-100 text-emerald-800"
                                  }`}
                                >
                                  {event.type}
                                </Badge>
                                {event.isRegistered && (
                                  <Badge className="bg-green-100 text-green-800">
                                    <Star className="w-3 h-3 mr-1" />
                                    Registered
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {event.title}
                              </h3>
                              <p className="text-gray-600 mt-2">
                                {event.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {event.date}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {event.time}
                            </div>
                            <div className="flex items-center gap-2">
                              <Mic className="w-4 h-4" />
                              {event.speaker}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-600">
                                {event.attendees}/{event.maxAttendees} attendees
                              </span>
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${(event.attendees / event.maxAttendees) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>

                            <Button
                              className={`${
                                event.isRegistered
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "bg-blue-600 hover:bg-blue-700"
                              } text-white`}
                              disabled={event.attendees >= event.maxAttendees}
                            >
                              {event.isRegistered ? "Registered" : "Register"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Event Categories & Info */}
                <div className="space-y-6">
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coffee className="w-5 h-5 text-orange-600" />
                        Event Types
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          type: "Webinars",
                          description: "Educational sessions on RWA topics",
                          count: 12,
                          icon: BookOpen,
                        },
                        {
                          type: "AMAs",
                          description: "Ask Me Anything with experts",
                          count: 8,
                          icon: MessageSquare,
                        },
                        {
                          type: "Workshops",
                          description: "Hands-on learning experiences",
                          count: 15,
                          icon: Target,
                        },
                        {
                          type: "Networking",
                          description: "Connect with community members",
                          count: 6,
                          icon: Users,
                        },
                      ].map((eventType, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                        >
                          <eventType.icon className="w-5 h-5 text-blue-600" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {eventType.type}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {eventType.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {eventType.count}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Community Perks
                      </h3>
                      <ul className="space-y-2 text-sm text-purple-800">
                        <li className="flex items-start gap-2">
                          <Star className="w-4 h-4 mt-0.5 text-purple-600" />
                          Early access to new features
                        </li>
                        <li className="flex items-start gap-2">
                          <Award className="w-4 h-4 mt-0.5 text-purple-600" />
                          Exclusive community badges
                        </li>
                        <li className="flex items-start gap-2">
                          <Gamepad2 className="w-4 h-4 mt-0.5 text-purple-600" />
                          Monthly community challenges
                        </li>
                        <li className="flex items-start gap-2">
                          <Trophy className="w-4 h-4 mt-0.5 text-purple-600" />
                          Recognition rewards program
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-8">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topContributors.map((contributor) => (
                      <div
                        key={contributor.rank}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            contributor.rank === 1
                              ? "bg-yellow-500"
                              : contributor.rank === 2
                                ? "bg-gray-400"
                                : contributor.rank === 3
                                  ? "bg-orange-600"
                                  : "bg-gray-600"
                          }`}
                        >
                          {contributor.rank}
                        </div>

                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {contributor.avatar}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {contributor.name}
                            </h3>
                            <Badge className={getBadgeColor(contributor.badge)}>
                              {contributor.badge}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {contributor.role}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {contributor.reputation}
                          </div>
                          <div className="text-sm text-gray-600">
                            {contributor.contributions} contributions
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Community Guidelines",
                    description:
                      "Learn about our community rules and best practices",
                    icon: BookOpen,
                    color: "blue",
                    link: "#guidelines",
                  },
                  {
                    title: "Getting Started Guide",
                    description: "New to TangibleFi? Start your journey here",
                    icon: Target,
                    color: "emerald",
                    link: "#getting-started",
                  },
                  {
                    title: "FAQ & Help Center",
                    description: "Find answers to commonly asked questions",
                    icon: HelpCircle,
                    color: "orange",
                    link: "#faq",
                  },
                  {
                    title: "Developer Resources",
                    description: "Technical documentation and API guides",
                    icon: Github,
                    color: "purple",
                    link: "/docs",
                  },
                  {
                    title: "Video Tutorials",
                    description:
                      "Watch step-by-step tutorials and walkthroughs",
                    icon: Youtube,
                    color: "red",
                    link: "#videos",
                  },
                  {
                    title: "Community Tools",
                    description:
                      "Useful tools and calculators for the community",
                    icon: Zap,
                    color: "yellow",
                    link: "/dashboard/calculator",
                  },
                ].map((resource, index) => (
                  <Card
                    key={index}
                    className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div
                        className={`w-12 h-12 bg-${resource.color}-100 rounded-lg flex items-center justify-center mb-4`}
                      >
                        <resource.icon
                          className={`w-6 h-6 text-${resource.color}-600`}
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {resource.description}
                      </p>
                      <Button
                        variant="outline"
                        className={`w-full border-${resource.color}-300 text-${resource.color}-700 hover:bg-${resource.color}-50`}
                        asChild
                      >
                        <Link href={resource.link}>
                          Access Resource
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Social Links */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Stay Connected
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Join our social channels for the latest updates, discussions,
                  and community highlights
                </p>

                <div className="flex items-center justify-center gap-4">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    asChild
                  >
                    <a
                      href="https://discord.gg/tangiblefi"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Discord
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-blue-300 text-blue-700"
                    asChild
                  >
                    <a
                      href="https://twitter.com/tangiblefi"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700"
                    asChild
                  >
                    <a
                      href="https://github.com/tangiblefi"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-700"
                    asChild
                  >
                    <a
                      href="https://youtube.com/@tangiblefi"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Youtube className="w-4 h-4 mr-2" />
                      YouTube
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center py-8 border-t border-gray-200">
            <p className="text-gray-600 mb-4">
              Join our thriving community of {communityStats[0].value} members
              building the future of RWA tokenization
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <Link href="/docs" className="text-blue-600 hover:text-blue-700">
                Documentation
              </Link>
              <Link
                href="/support"
                className="text-blue-600 hover:text-blue-700"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
