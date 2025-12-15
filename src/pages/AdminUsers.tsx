import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Mail, Phone, GraduationCap, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllUsers, searchUsers } from "@/integrations/firebase/firebaseService";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
        if (data.length > 0) setSelectedUser(data[0]);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        toast({
          title: "Error loading users",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);
  const getLevelColor = (level: string) => {
    switch(level) {
      case "PhD": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "Masters": return "bg-primary/10 text-primary border-primary/20";
      case "Undergraduate": return "bg-green-500/10 text-green-500 border-green-500/20";
      default: return "";
    }
  };

  // Filter users
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.school?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);
  return (
    <>
      <Helmet>
        <title>Users Management - Admin - BuildWave</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/admin">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">Users Management</h1>
                  <p className="text-sm text-muted-foreground">View and manage student accounts</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {users.reduce((sum, u) => sum + u.projectsCount - u.completedProjects, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {users.reduce((sum, u) => sum + u.completedProjects, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-500">₦2.03M</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Students ({filteredUsers.length})</CardTitle>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Projects</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Loading users...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow 
                            key={user.id}
                            className={selectedUser?.id === user.id ? "bg-muted/50" : "cursor-pointer"}
                            onClick={() => setSelectedUser(user)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={user.photoUrl} alt={user.name} />
                                  <AvatarFallback>{user.name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{user.school || "N/A"}</TableCell>
                            <TableCell>
                              <Badge className={getLevelColor(user.level)}>
                                {user.level || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <span className="font-medium">{user.projectsCount || 0}</span>
                                <span className="text-muted-foreground"> ({user.completedProjects || 0} done)</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{user.totalSpent || "₦0"}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="ghost" onClick={() => setSelectedUser(user)}>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* User Detail */}
            <div>
              {selectedUser && (
                <Card>
                  <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-20 w-20 mb-3">
                        <AvatarImage src={selectedUser.photoUrl} alt={selectedUser.name} />
                        <AvatarFallback className="text-lg">
                          {selectedUser.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                      <Badge className={`mt-2 ${getLevelColor(selectedUser.level)}`}>
                        {selectedUser.level}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm">{selectedUser.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm">{selectedUser.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <GraduationCap className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Education</p>
                          <p className="text-sm font-medium">{selectedUser.school}</p>
                          <p className="text-sm text-muted-foreground">{selectedUser.course}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm">{selectedUser.location}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Projects</span>
                        <span className="font-medium">{selectedUser.projectsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Completed</span>
                        <span className="font-medium text-green-500">{selectedUser.completedProjects}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Spent</span>
                        <span className="font-medium">{selectedUser.totalSpent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Joined</span>
                        <span className="text-sm">{selectedUser.joinedAt}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Active</span>
                        <span className="text-sm">{selectedUser.lastActive}</span>
                      </div>
                    </div>

                    <Button className="w-full" variant="outline">
                      View All Projects
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUsers;
