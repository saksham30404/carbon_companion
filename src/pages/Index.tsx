import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, AlertTriangle, Plus, User, LogOut, Gift, Map, Navigation, MapPin, Calendar, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CarbonActivityCard from '@/components/CarbonActivityCard';
import MicroHabitCard from '@/components/MicroHabitCard';
import CarbonChart from '@/components/CarbonChart';
import UserProgress from '@/components/UserProgress';
import DayTracker from '@/components/DayTracker';
import CarbonActivityForm from '@/components/CarbonActivityForm';
import RoutePlannerForm from '@/components/RoutePlannerForm';
import Footer from '@/components/Footer';
import EcoHabitChatbot from '@/components/EcoHabitChatbot'; // Import EcoHabitChatbot
import {
  CarbonActivity,
  MOCK_ACTIVITIES,
  MOCK_USER,
  MicroHabit,
  getRandomMicroHabits,
  UserProfile
} from '@/lib/carbon-utils';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComp } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define reward interface
interface Reward {
  id: string;
  title: string;
  description: string;
  pointCost: number;
  icon: React.ReactNode;
  category: 'voucher' | 'badge' | 'tier';
  isAvailable: boolean;
}

// Define environmental events interface
interface EcoEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: string;
  imageUrl?: string;
  link: string;
  category: 'cleanup' | 'workshop' | 'protest' | 'fundraiser';
}

// Extend UserProfile type to include redeemedRewards
interface ExtendedUserProfile extends UserProfile {
  redeemedRewards?: string[];
  treesPlanted?: number;
}

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<CarbonActivity[]>(MOCK_ACTIVITIES);
  const [user, setUser] = useState<ExtendedUserProfile | null>(null);
  const [habits, setHabits] = useState<MicroHabit[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [events, setEvents] = useState<EcoEvent[]>([]);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const eventForm = useForm({
    defaultValues: {
      title: '',
      description: '',
      date: new Date(),
      location: '',
      organizer: '',
      link: '',
      category: 'cleanup' as const
    }
  });

  useEffect(() => {
    // Check for logged in user
    const storedUser = localStorage.getItem('carbonCompanionUser');
    
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      // Make sure redeemedRewards exists
      if (!userObj.redeemedRewards) {
        userObj.redeemedRewards = [];
      }
      if (!userObj.treesPlanted) {
        userObj.treesPlanted = 0;
      }
      setUser(userObj);
    } else {
      // Default to MOCK_USER if no stored user
      const mockUserWithRedeemed = {
        ...MOCK_USER,
        redeemedRewards: [],
        treesPlanted: 0
      };
      setUser(mockUserWithRedeemed);
    }
  }, []);
  
  useEffect(() => {
    if (!user) return;
    
    // Get personalized micro-habits based on user's activities
    const suggestedHabits = getRandomMicroHabits(6, activities);
    
    // Mark those that have been adopted
    const habitsWithAdoptionStatus = suggestedHabits.map(habit => ({
      ...habit,
      isAdopted: user.adoptedHabits.includes(habit.id)
    }));
    
    setHabits(habitsWithAdoptionStatus);
    
    // Setup rewards data
    setRewards([
      {
        id: '1',
        title: '5% Off Eco Store',
        description: 'Get 5% off your next purchase at participating eco-friendly stores',
        pointCost: 200,
        icon: <Gift className="h-8 w-8 text-green-500" />,
        category: 'voucher',
        isAvailable: user.points >= 200,
      },
      {
        id: '2',
        title: 'Tree Planter Badge',
        description: 'Earn this badge after adopting 5 eco-habits',
        pointCost: 100,
        icon: <Gift className="h-8 w-8 text-green-500" />,
        category: 'badge',
        isAvailable: user.points >= 100,
      },
      {
        id: '3',
        title: 'Carbon Conscious Tier',
        description: 'Unlock advanced features and exclusive rewards',
        pointCost: 500,
        icon: <Gift className="h-8 w-8 text-amber-500" />,
        category: 'tier',
        isAvailable: user.points >= 500,
      },
    ]);
    
    // Setup events data
    setEvents([
      {
        id: '1',
        title: 'Community Park Cleanup',
        description: 'Join us for a morning of cleaning up Central Park and learning about local biodiversity.',
        date: '2025-04-15',
        location: 'Central Park',
        organizer: 'Green Earth Initiative',
        link: '#',
        category: 'cleanup'
      },
      {
        id: '2',
        title: 'Sustainable Living Workshop',
        description: 'Learn practical tips for reducing your carbon footprint in daily life.',
        date: '2025-04-22',
        location: 'Online',
        organizer: 'Eco Warriors',
        link: '#',
        category: 'workshop'
      }
    ]);
  }, [activities, user?.adoptedHabits]);
  
  const handleAddActivity = (activity: CarbonActivity) => {
    setActivities(prev => [activity, ...prev]);
  };
  
  const handleAdoptHabit = (habitId: string) => {
    if (!user) return;
    
    // Update user's adopted habits
    const updatedUser = {
      ...user,
      adoptedHabits: [...user.adoptedHabits, habitId],
      points: user.points + 10,
      totalSavedKg: user.totalSavedKg + (habits.find(h => h.id === habitId)?.potentialSavingKg || 0)
    };
    
    setUser(updatedUser);
    
    // If logged in, update localStorage
    localStorage.setItem('carbonCompanionUser', JSON.stringify(updatedUser));
    
    // Update habits list to show as adopted
    setHabits(prev => 
      prev.map(habit => 
        habit.id === habitId
          ? { ...habit, isAdopted: true }
          : habit
      )
    );
    
    toast({
      title: "Habit adopted!",
      description: "Keep it up! You've earned 10 points.",
    });
  };

  const handleAddCustomHabit = (habit: { name: string; description: string; carbonImpact: string }) => {
    const newHabit: MicroHabit = {
      id: `custom-${Date.now()}`,
      title: habit.name,  
      icon: 'footprints',
      description: `${habit.description} (${habit.carbonImpact})`,
      potentialSavingKg: parseInt(habit.carbonImpact) || 5,
      difficulty: 'medium',
      category: 'home'
    };
    
    setHabits(prev => [newHabit, ...prev]);
  };

  const handleRedeemReward = (reward: Reward) => {
    if (!user || user.points < reward.pointCost) {
      toast({
        title: 'Not enough points',
        description: `You need ${reward.pointCost - (user?.points || 0)} more points to redeem this reward.`,
        variant: 'destructive',
      });
      return;
    }
    
    // Get user's redeemed rewards or initialize empty array
    const redeemedRewards = user.redeemedRewards || [];
    
    // Update user points
    const updatedUser = {
      ...user,
      points: user.points - reward.pointCost,
      redeemedRewards: [...redeemedRewards, reward.id],
    };
    
    setUser(updatedUser);
    localStorage.setItem('carbonCompanionUser', JSON.stringify(updatedUser));
    
    toast({
      title: 'Reward redeemed!',
      description: `You've successfully redeemed: ${reward.title}`,
    });
  };
  
  const handleDonatePoints = (points: number, trees: number) => {
    if (!user || user.points < points) {
      toast({
        title: 'Not enough points',
        description: `You need ${points - (user?.points || 0)} more points to donate.`,
        variant: 'destructive',
      });
      return;
    }
    
    // Update user points
    const updatedUser = {
      ...user,
      points: user.points - points,
      treesPlanted: (user.treesPlanted || 0) + trees
    };
    
    setUser(updatedUser);
    localStorage.setItem('carbonCompanionUser', JSON.stringify(updatedUser));
    
    toast({
      title: "Thank You!",
      description: `You've donated ${points} points to plant ${trees} tree${trees > 1 ? 's' : ''}`,
    });
  };
  
  const handleLogout = () => {
    localStorage.removeItem('carbonCompanionUser');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
    navigate('/login');
  };
  
  // Calculate quick stats
  const totalCarbon = activities.reduce((sum, activity) => sum + activity.carbonKg, 0);
  const todayCarbon = activities
    .filter(a => {
      const today = new Date();
      const activityDate = new Date(a.date);
      return activityDate.getDate() === today.getDate() &&
             activityDate.getMonth() === today.getMonth() &&
             activityDate.getFullYear() === today.getFullYear();
    })
    .reduce((sum, activity) => sum + activity.carbonKg, 0);
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  // Calculate next tier
  const currentPoints = user.points;
  const nextTier = {
    name: 'Carbon Conscious',
    points: 500,
    progress: Math.min((currentPoints / 500) * 100, 100),
  };
  
  const onSubmitEvent = (data: any) => {
    const newEvent: EcoEvent = {
      id: Math.random().toString(36).substring(2, 9),
      title: data.title,
      description: data.description,
      date: format(data.date, 'yyyy-MM-dd'),
      location: data.location,
      organizer: data.organizer || 'You',
      link: data.link || '#',
      category: data.category
    };
    
    setEvents([...events, newEvent]);
    setIsCreatingEvent(false);
    eventForm.reset();
    toast({
      title: 'Event created!',
      description: 'Your environmental event has been successfully added.',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b shadow-sm bg-background">
        <div className="container py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold eco-gradient-text">Carbon Companion</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full hover:shadow-md transition-all">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Activity
                </Button>
              </DialogTrigger>
              <DialogContent>
                <CarbonActivityForm onAddActivity={handleAddActivity} />
              </DialogContent>
            </Dialog>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full hover:shadow-md transition-all">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline">{user?.name || 'Account'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl shadow-lg border border-border/50 bg-card">
                <DropdownMenuItem onClick={() => navigate('/account')} className="rounded-lg hover:bg-primary/10">
                  <User className="h-4 w-4 mr-2 text-primary" />
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('routeplanner')} className="rounded-lg hover:bg-primary/10">
                  <Navigation className="h-4 w-4 mr-2 text-primary" />
                  Route Planner
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="rounded-lg hover:bg-destructive/10">
                  <LogOut className="h-4 w-4 mr-2 text-destructive" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <div className="bg-muted/50 border-b">
        <div className="container">
          <div className="flex overflow-x-auto pb-1 pt-1">
            {/* Wrap the TabsList in a Tabs component */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent flex justify-start w-full gap-1">
                <TabsTrigger 
                  value="dashboard"
                  className="rounded-full bg-background/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="activities"
                  className="rounded-full bg-background/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Activities
                </TabsTrigger>
                <TabsTrigger 
                  value="habits"
                  className="rounded-full bg-background/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Eco-Habits
                </TabsTrigger>
                <TabsTrigger 
                  value="rewards"
                  className="rounded-full bg-background/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Rewards
                </TabsTrigger>
                <TabsTrigger 
                  value="routeplanner"
                  className="rounded-full bg-background/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Route Planner
                </TabsTrigger>
                <TabsTrigger 
                  value="events"
                  className="rounded-full bg-background/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Events
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1 container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User progress card */}
              <Card className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden">
                <CardContent className="p-0">
                  <UserProgress user={user} />
                </CardContent>
              </Card>
              
              {/* Day Tracker */}
              <Card className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden">
                <CardContent className="p-0">
                  <DayTracker activities={activities} />
                </CardContent>
              </Card>
              
              {/* Quick stats */}
              <Card className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden bg-gradient-to-br from-secondary to-secondary/60">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Total Carbon Impact</h3>
                  <p className="text-3xl font-bold eco-gradient-text">{totalCarbon.toFixed(1)} kg CO₂</p>
                  <div className="flex items-center mt-4 text-sm text-muted-foreground">
                    <Leaf className="h-4 w-4 mr-2 text-green-500" />
                    <span>From {activities.length} tracked activities</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Route Planner Promo Card */}
            <Dialog>
              <DialogTrigger asChild>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-6 w-6 text-green-500" />
                      <CardTitle>Plan Eco-Friendly Routes</CardTitle>
                    </div>
                    <CardDescription className="mt-2">
                      Discover the most carbon-efficient routes for your daily commute and travel.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button className="w-full gap-2">
                      <Navigation className="h-4 w-4" />
                      Plan Route
                    </Button>
                  </CardFooter>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>Plan Your Eco-Friendly Route</DialogTitle>
                  <DialogDescription>
                    Enter your locations to find the most carbon-efficient travel options.
                  </DialogDescription>
                </DialogHeader>
                <RoutePlannerForm 
                  onCalculateRoutes={(routeData) => {
                    toast({
                      title: "Route Calculated",
                      description: `Found ${routeData.routes?.length || 0} eco-friendly routes`,
                    });
                  }} 
                />
              </DialogContent>
            </Dialog>
            
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Daily Carbon Footprint</CardTitle>
                </CardHeader>
                <CardContent>
                  <CarbonChart 
                    activities={activities} 
                    chartType="daily" 
                    title="" 
                  />
                </CardContent>
              </Card>
              
              <Card className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Carbon by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <CarbonChart 
                    activities={activities} 
                    chartType="category" 
                    title="" 
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Suggested habits */}
            <Card className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Suggested Eco Habits</CardTitle>
                <CardDescription>Small changes that make a big difference</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {habits.slice(0, 3).map(habit => (
                    <MicroHabitCard
                      key={habit.id} 
                      habit={habit} 
                      isAdopted={user?.adoptedHabits.includes(habit.id) || false}
                      onAdopt={handleAdoptHabit}
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="ghost" 
                  className="ml-auto text-primary hover:text-primary/80"
                  onClick={() => setActiveTab('habits')}
                >
                  View all habits
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">Your Activities</CardTitle>
                    <CardDescription>Track and monitor your carbon footprint</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="rounded-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <CarbonActivityForm onAddActivity={handleAddActivity} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activities.map(activity => (
                    <CarbonActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Habits Tab */}
          <TabsContent value="habits" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <EcoHabitChatbot onAddHabit={handleAddCustomHabit} />
              {habits.map((habit) => (
                <MicroHabitCard
                  key={habit.id}
                  habit={habit}
                  isAdopted={user?.adoptedHabits.includes(habit.id) || false}
                  onAdopt={() => handleAdoptHabit(habit.id)}
                />
              ))}
            </div>
            
            <Card className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Your Impact</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <p className="text-lg mb-2">You've saved</p>
                <p className="text-4xl font-bold eco-gradient-text mb-4">{user.totalSavedKg} kg CO₂</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  That's like taking {Math.round(user.totalSavedKg / 20)} trees' worth of CO₂ out of the atmosphere!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="col-span-1 md:col-span-3 shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold eco-gradient-text">{user.points}</span>
                    <span className="text-muted-foreground">carbon points</span>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Progress to next tier</span>
                      <span className="text-sm font-medium">{nextTier.progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={nextTier.progress} className="h-2" />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Current</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{nextTier.name}</span>
                        <Gift className="h-3 w-3 text-amber-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden">
                <CardContent className="pt-6">
                  <h3 className="font-medium text-lg mb-4">Earn More</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 bg-primary/5 p-2 rounded-lg">
                      <Gift className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Complete 7-day streak</span>
                    </li>
                    <li className="flex items-start gap-2 bg-primary/5 p-2 rounded-lg">
                      <Gift className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span className="text-sm">Adopt 3 more eco-habits</span>
                    </li>
                    <li className="flex items-start gap-2 bg-primary/5 p-2 rounded-lg">
                      <Gift className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span className="text-sm">Reduce weekly emissions by 5%</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <Card className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">Available Rewards</CardTitle>
                <CardDescription>Redeem your points for these eco-friendly rewards</CardDescription>
                
                {/* Donate Points Section */}
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Donate Points to Plant Trees</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { points: 50, trees: 1 },
                      { points: 100, trees: 2 },
                      { points: 200, trees: 5 },
                      { points: 500, trees: 10 }
                    ].map((option) => (
                      <Button 
                        key={option.points}
                        variant="outline"
                        size="sm"
                        disabled={!user || user.points < option.points}
                        onClick={() => handleDonatePoints(option.points, option.trees)}
                      >
                        {option.points} pts = {option.trees} tree{option.trees > 1 ? 's' : ''}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewards.map((reward) => (
                    <Card key={reward.id} className={`shadow-sm border border-border/50 overflow-hidden 
                      ${!reward.isAvailable ? 'opacity-70' : 'hover:shadow-md transition-all'}`}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            {reward.icon}
                          </div>
                          <Badge variant={reward.isAvailable ? 'default' : 'outline'} className="rounded-full">
                            {reward.pointCost} points
                          </Badge>
                        </div>
                        
                        <h3 className="font-medium text-lg mb-2">{reward.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {reward.description}
                        </p>
                        
                        <Badge className="mb-4 rounded-full" variant="outline">
                          {reward.category === 'voucher' ? 'Discount Voucher' : 
                          reward.category === 'badge' ? 'Achievement Badge' : 'Membership Tier'}
                        </Badge>
                        
                        <Button 
                          className="w-full rounded-full" 
                          variant={reward.isAvailable ? 'default' : 'outline'}
                          disabled={!reward.isAvailable}
                          onClick={() => handleRedeemReward(reward)}
                        >
                          {reward.isAvailable ? 'Redeem Reward' : `Need ${reward.pointCost - user.points} more points`}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Route Planner Tab */}
          <TabsContent value="routeplanner" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Map className="h-5 w-5 text-primary" />
                  <span>Eco-Friendly Route Planner</span>
                </h2>
                <p className="text-muted-foreground">Find the most environmentally friendly route for your journey</p>
              </div>
            </div>
            
            <RoutePlannerForm onCalculateRoutes={(routeData) => {
              // In a real app, this would make an API call to your backend
              // The mock data is generated in the RoutePlannerForm component
              
              // Points for using the route planner (a small incentive)
              if (user) {
                const updatedUser = {
                  ...user,
                  points: user.points + 2
                };
                setUser(updatedUser);
                localStorage.setItem('carbonCompanionUser', JSON.stringify(updatedUser));
                
                toast({
                  title: "Route planning complete!",
                  description: "You've earned 2 points for planning an eco-friendly route.",
                });
              }
            }} />
            
            <Card className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 dark:bg-green-800/30 p-3 rounded-full">
                    <Leaf className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Why Plan Your Route?</h3>
                    <p className="text-sm text-muted-foreground">
                      Different routes can have significantly different carbon footprints. By choosing the most eco-friendly route, 
                      you can reduce your emissions by up to 30% compared to the most carbon-intensive option.
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center p-3 bg-white/70 dark:bg-background/70 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">↓15%</p>
                        <p className="text-xs text-muted-foreground">Average CO₂ Reduction</p>
                      </div>
                      <div className="text-center p-3 bg-white/70 dark:bg-background/70 rounded-lg">
                        <p className="text-2xl font-bold text-amber-600">↓8%</p>
                        <p className="text-xs text-muted-foreground">Avg. Fuel Savings</p>
                      </div>
                      <div className="text-center p-3 bg-white/70 dark:bg-background/70 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">+5min</p>
                        <p className="text-xs text-muted-foreground">Typical Time Trade-off</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">Environmental Events</CardTitle>
                <CardDescription>
                  Join local events to make a bigger impact and connect with like-minded individuals.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map(event => (
                    <Card key={event.id} className="shadow-sm hover:shadow-md transition-all border border-border/50 overflow-hidden">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-primary" />
                          </div>
                          <Badge variant="default" className="rounded-full">
                            {event.date}
                          </Badge>
                        </div>
                        
                        <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {event.description}
                        </p>
                        
                        <Badge className="mb-4 rounded-full" variant="outline">
                          {event.category === 'cleanup' ? 'Cleanup Event' : 
                          event.category === 'workshop' ? 'Workshop' : 
                          event.category === 'protest' ? 'Protest' : 'Fundraiser'}
                        </Badge>
                        
                        <Button 
                          className="w-full rounded-full" 
                          variant="default"
                          onClick={() => window.open(event.link, '_blank')}
                        >
                          Learn More
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Dialog open={isCreatingEvent} onOpenChange={setIsCreatingEvent}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 mt-4">
                  <Plus className="h-4 w-4" />
                  Host Your Own Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Host an Environmental Event</DialogTitle>
                  <DialogDescription>
                    Share your eco-friendly initiative with the community
                  </DialogDescription>
                </DialogHeader>
                <Form {...eventForm}>
                  <form onSubmit={eventForm.handleSubmit(onSubmitEvent)} className="space-y-4">
                    <FormField
                      control={eventForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Community Beach Cleanup" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={eventForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell people about your event and its environmental impact" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={eventForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="pl-3 text-left font-normal"
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComp
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={eventForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cleanup">Cleanup Event</SelectItem>
                                <SelectItem value="workshop">Workshop</SelectItem>
                                <SelectItem value="protest">Protest</SelectItem>
                                <SelectItem value="fundraiser">Fundraiser</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={eventForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Central Park or Online" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={eventForm.control}
                        name="organizer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organizer Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name or organization" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={eventForm.control}
                        name="link"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registration Link (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button type="submit" className="gap-2">
                        <Check className="h-4 w-4" />
                        Submit Event
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;