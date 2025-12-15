// Example: Firebase Integration for AuthModal.tsx

import { useFirebaseAuth } from "@/integrations/firebase/useFirebaseAuth";
import { createUser } from "@/integrations/firebase/firebaseService";
import { useFirebaseMutation } from "@/hooks/useFirebaseQuery";
import { useToast } from "@/components/ui/use-toast";

// Within your AuthModal component:

export const AuthModalWithFirebase = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, login } = useFirebaseAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Mutation for user registration
  const { mutate: registerUser, loading: registerLoading } = useFirebaseMutation(
    async (userData) => {
      // Register with Firebase Auth
      const userCredential = await register(email, password);
      
      if (!userCredential) {
        throw new Error("Registration failed");
      }

      // Create user document in Firestore
      await createUser(userCredential.user.uid, {
        name: fullName,
        email: email,
        photoUrl: "",
        school: userData.school || "",
        level: userData.level || "",
        course: userData.course || "",
        projectsCount: 0,
        completedProjects: 0,
        totalSpent: "₦0",
        joinedAt: new Date(),
        lastActive: new Date(),
      });

      return userCredential.user.uid;
    },
    {
      showErrorToast: true,
      onSuccess: (userId) => {
        toast({
          title: "Success!",
          description: "Account created successfully",
        });
        navigate("/dashboard");
        onOpenChange(false);
      },
    }
  );

  // Mutation for user login
  const { mutate: loginUser, loading: loginLoading } = useFirebaseMutation(
    async () => {
      await login(email, password);
    },
    {
      showErrorToast: true,
      onSuccess: () => {
        toast({
          title: "Success!",
          description: "Logged in successfully",
        });
        navigate("/dashboard");
        onOpenChange(false);
      },
    }
  );

  const handleSignUp = async () => {
    if (!email || !fullName || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    await registerUser({ school: "", level: "Undergraduate" });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    await loginUser();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join BuildWave</DialogTitle>
          <DialogDescription>Create an account or sign in</DialogDescription>
        </DialogHeader>

        {/* Sign Up Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              disabled={registerLoading || loginLoading}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={registerLoading || loginLoading}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={registerLoading || loginLoading}
            />
          </div>

          <Button
            onClick={handleSignUp}
            disabled={registerLoading || loginLoading}
            className="w-full"
          >
            {registerLoading ? "Creating account..." : "Sign Up"}
          </Button>

          <Button
            onClick={handleLogin}
            variant="outline"
            disabled={registerLoading || loginLoading}
            className="w-full"
          >
            {loginLoading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ====================================================
// Example: Firebase Integration for ProjectRequestModal
// ====================================================

import { createProject } from "@/integrations/firebase/firebaseService";
import { useFirebaseAuth } from "@/integrations/firebase/useFirebaseAuth";

export const ProjectRequestModalWithFirebase = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const { user } = useFirebaseAuth();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const { mutate: submitProject, loading: submitting } = useFirebaseMutation(
    async () => {
      if (!user) {
        throw new Error("Please sign in first");
      }

      const projectId = await createProject({
        userId: user.uid,
        title,
        description,
        category,
        amount: parseFloat(amount),
        status: "pending",
        requirements: [],
        attachments: [],
      });

      return projectId;
    },
    {
      onSuccess: (projectId) => {
        toast({
          title: "Success!",
          description: "Project request submitted successfully",
        });
        setTitle("");
        setDescription("");
        setCategory("");
        setAmount("");
        onOpenChange(false);
      },
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !category || !amount) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    await submitProject();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
              disabled={submitting}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project"
              disabled={submitting}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={submitting}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a category</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Web Development">Web Development</option>
              <option value="Data Science">Data Science</option>
              <option value="IoT & Embedded Systems">IoT & Embedded Systems</option>
              <option value="Research & Thesis">Research & Thesis</option>
            </select>
          </div>

          <div>
            <Label htmlFor="amount">Budget (₦)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="5000"
              disabled={submitting}
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ====================================================
// Example: Firebase Integration for TrackProjectModal
// ====================================================

import { getProject } from "@/integrations/firebase/firebaseService";
import { useFirebaseQuery } from "@/hooks/useFirebaseQuery";

export const TrackProjectModalWithFirebase = ({ open, onOpenChange, projectId }) => {
  const { data: project, loading, execute } = useFirebaseQuery(
    () => getProject(projectId),
    { showErrorToast: true, errorMessage: "Could not load project details" }
  );

  useEffect(() => {
    if (open && projectId) {
      execute();
    }
  }, [open, projectId, execute]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Track Project</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Loading project...</div>
        ) : project ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{project.title}</h3>
              <p className="text-muted-foreground">{project.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Status</span>
                <Badge>{project.status}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Category</span>
                <Badge variant="outline">{project.category}</Badge>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground">Budget</span>
              <p className="font-semibold">₦{project.amount}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Project not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ====================================================
// Example: Firebase Integration for Testimonials
// ====================================================

import { createTestimonial } from "@/integrations/firebase/firebaseService";

export const TestimonialSubmitWithFirebase = () => {
  const { user } = useFirebaseAuth();
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");

  const { mutate: submitTestimonial, loading } = useFirebaseMutation(
    async () => {
      if (!user) {
        throw new Error("Please sign in first");
      }

      await createTestimonial({
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userImage: user.photoURL || "",
        rating,
        message,
      });
    },
    {
      onSuccess: () => {
        toast({
          title: "Thank you!",
          description: "Your testimonial has been submitted for approval",
        });
        setRating(5);
        setMessage("");
      },
    }
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); submitTestimonial(); }}>
      <div className="space-y-4">
        <div>
          <Label>Rating</Label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            disabled={loading}
          >
            <option value={1}>1 - Poor</option>
            <option value={2}>2 - Fair</option>
            <option value={3}>3 - Good</option>
            <option value={4}>4 - Very Good</option>
            <option value={5}>5 - Excellent</option>
          </select>
        </div>

        <div>
          <Label>Your Message</Label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
            placeholder="Share your experience..."
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Testimonial"}
        </Button>
      </div>
    </form>
  );
};
