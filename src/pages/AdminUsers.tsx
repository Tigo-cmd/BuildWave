import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  Loader2,
  Plus,
  Edit,
  Trash2,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getUserRole,
} from "@/integrations/firebase/firebaseService";

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Forms state
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    school: "",
    course: "",
    level: "undergraduate",
    location: "",
    role: "student",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      // map full_name to name if missing
      const mapped = data.map((u: any) => ({
        ...u,
        name: u.name || u.full_name || "Unnamed Student",
        level: u.level || u.education_level || "undergraduate",
        course: u.course || u.course_of_study || "",
      }));
      setUsers(mapped);
      setFilteredUsers(mapped);
      if (mapped.length > 0 && !selectedUser) setSelectedUser(mapped[0]);
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

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const getLevelColor = (level: string) => {
    const l = level?.toLowerCase();
    switch (l) {
      case "phd":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "masters":
        return "bg-primary/10 text-primary border-primary/20";
      case "undergraduate":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "";
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newId = `user-${Date.now()}`;
      await createUser(newId, {
        full_name: userForm.name,
        email: userForm.email,
        phone: userForm.phone,
        school: userForm.school,
        course_of_study: userForm.course,
        education_level: userForm.level,
        location: userForm.location,
      });
      await updateUserRole(newId, userForm.role);

      toast({ title: "Success", description: "User account created successfully!" });
      setIsCreateOpen(false);
      setUserForm({
        name: "",
        email: "",
        phone: "",
        school: "",
        course: "",
        level: "undergraduate",
        location: "",
        role: "student",
      });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (u: any) => {
    setUserForm({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      school: u.school || "",
      course: u.course || u.course_of_study || "",
      level: u.level || u.education_level || "undergraduate",
      location: u.location || "",
      role: u.role || "student",
    });
    setSelectedUser(u);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setLoading(true);
      await updateUser(selectedUser.id, {
        full_name: userForm.name,
        email: userForm.email,
        phone: userForm.phone,
        school: userForm.school,
        course_of_study: userForm.course,
        education_level: userForm.level,
        location: userForm.location,
      });
      await updateUserRole(selectedUser.id, userForm.role);

      toast({ title: "Success", description: "User updated successfully!" });
      setIsEditOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmId) return;
    try {
      setLoading(true);
      await deleteUser(deleteConfirmId);
      toast({ title: "Deleted", description: "User account deleted." });
      setDeleteConfirmId(null);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
                  <h1 className="text-2xl font-bold gradient-text">Users & Students Management</h1>
                  <p className="text-sm text-muted-foreground">Manage user profiles, academic details and roles</p>
                </div>
              </div>

              <Button className="btn-hero" onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add New User
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Registered Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Undergraduates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {users.filter((u) => u.level?.toLowerCase() === "undergraduate").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Postgraduates (MSc/PhD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">
                  {users.filter((u) => u.level?.toLowerCase() === "masters" || u.level?.toLowerCase() === "phd").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-500">
                  {users.filter((u) => u.role === "admin").length}
                </div>
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
                        placeholder="Search by name, email or school..."
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
                        <TableHead>Phone</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Loading users...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                                  <AvatarFallback>
                                    {user.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{user.school || "N/A"}</TableCell>
                            <TableCell>
                              <Badge className={getLevelColor(user.level)}>{user.level || "N/A"}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">{user.phone || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditDialog(user)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => setDeleteConfirmId(user.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* User Detail View */}
            <div>
              {selectedUser ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>User Profile</CardTitle>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(selectedUser)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteConfirmId(selectedUser.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-20 w-20 mb-3">
                        <AvatarImage src={selectedUser.photoUrl} alt={selectedUser.name} />
                        <AvatarFallback className="text-lg">
                          {selectedUser.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
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
                          <p className="text-xs text-muted-foreground">Email Address</p>
                          <p className="text-sm font-medium">{selectedUser.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Phone Number</p>
                          <p className="text-sm">{selectedUser.phone || "Not specified"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <GraduationCap className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Education</p>
                          <p className="text-sm font-medium">{selectedUser.school || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{selectedUser.course || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm">{selectedUser.location || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    Select a student user to view details
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE USER DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Student Account</DialogTitle>
            <DialogDescription>Create a student profile directly into Firestore.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                required
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="Chidi Okafor"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  required
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="chidi@unilag.edu.ng"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="+234..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>University / School</Label>
              <Input
                value={userForm.school}
                onChange={(e) => setUserForm({ ...userForm, school: e.target.value })}
                placeholder="University of Lagos"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course of Study</Label>
                <Input
                  value={userForm.course}
                  onChange={(e) => setUserForm({ ...userForm, course: e.target.value })}
                  placeholder="Computer Engineering"
                />
              </div>
              <div className="space-y-2">
                <Label>Education Level</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={userForm.level}
                  onChange={(e) => setUserForm({ ...userForm, level: e.target.value })}
                >
                  <option value="undergraduate">Undergraduate</option>
                  <option value="masters">Masters</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={userForm.location}
                  onChange={(e) => setUserForm({ ...userForm, location: e.target.value })}
                  placeholder="Lagos, Nigeria"
                />
              </div>
              <div className="space-y-2">
                <Label>App Role</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full btn-hero" disabled={loading}>
              Create User Account
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT USER DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>Update student details and credentials.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                required
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  required
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>University / School</Label>
              <Input
                value={userForm.school}
                onChange={(e) => setUserForm({ ...userForm, school: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course of Study</Label>
                <Input
                  value={userForm.course}
                  onChange={(e) => setUserForm({ ...userForm, course: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Education Level</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={userForm.level}
                  onChange={(e) => setUserForm({ ...userForm, level: e.target.value })}
                >
                  <option value="undergraduate">Undergraduate</option>
                  <option value="masters">Masters</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={userForm.location}
                  onChange={(e) => setUserForm({ ...userForm, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>App Role</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full btn-hero" disabled={loading}>
              Save User Profile
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM DIALOG */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account from BuildWave.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete Account
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminUsers;

