import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import loginBG from "../../assets/test1.png";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { SIGNUP_ROUTE, LOGIN_ROUTE } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import { FiEye, FiEyeOff } from "react-icons/fi"; // Icons for password toggle

const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Toggle password visibility
  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  // Validate password strength
  const isStrongPassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };

  const validateSignup = () => {
    if (!email.length) {
      toast.error("Email is required");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required");
      return false;
    }
    if (!isStrongPassword(password)) {
      toast.error(
        "Password must be at least 8 characters, include an uppercase letter, a number, and a special character."
      );
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Password and confirm password should match.");
      return false;
    }
    return true;
  };

  const validateLogin = () => {
    if (!email.length) {
      toast.error("Email is required");
      return false;
    }
    if (!password.length) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (validateLogin()) {
      try {
        const response = await apiClient.post(
          LOGIN_ROUTE,
          { email, password },
          { withCredentials: true }
        );

        const user = response.data?.userData;

        if (user?.id) {
          setUserInfo(user);
          navigate(user.profileSetup ? "/chat" : "/profile");
          const firstName = user.firstName || user.email.split("@")[0];

          toast.success(`Welcome back, ${firstName}!`);
        } else {
          toast.error("Login failed: Unable to verify your account details.");
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Invalid email or password.");
      }
    }
  };

  const handleSignup = async () => {
    if (validateSignup()) {
      try {
        const response = await apiClient.post(
          SIGNUP_ROUTE,
          { email, password },
          { withCredentials: true }
        );

        if (response.status === 201) {
          setUserInfo(response.data.user);
          toast.success("Account created successfully!Login to procceed");
        }
      } catch (error) {
        console.error("Signup error:", error);
        toast.error(
          "An account with this email already exists. Please log in."
        );
      }
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center bg-gradient-to-b from-[#1c1b29] to-[#2a2b33]">
      <div className="h-[90vh] sm:h-[75vh] md:h-[80vh] bg-[#1b1b2e] border-2 border-[#8417ff] shadow-xl w-[90vw] md:w-[80vw] lg:w-[70vw] rounded-3xl grid lg:grid-cols-2 overflow-hidden">
        <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-[#8417ff] to-[#3b096a] p-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-6">Welcome Back!</h1>
          <p className="text-white text-lg mb-8">
            Stay connected with the best chat experience.
          </p>
          <img src={loginBG} alt="Welcome" className="w-[420px] rounded-lg" />
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-[#1c1b29]">
          <h2 className="text-3xl font-semibold text-white mb-8">
            {activeTab === "login" ? "Login" : "Signup"}
          </h2>
          <Tabs
            className="w-full max-w-[400px]"
            defaultValue="login"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="bg-transparent rounded-none w-full mb-4">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-[#8417ff] text-white w-full p-3 transition-all duration-300"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-[#8417ff] text-white w-full p-3 transition-all duration-300"
              >
                Signup
              </TabsTrigger>
            </TabsList>

            <div className="relative">
              <TabsContent value="login" className="flex flex-col gap-4">
                <Input
                  placeholder="Email"
                  type="email"
                  className="p-4 text-white bg-[#2a2b3a] border border-[#8417ff] rounded-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="relative">
                  <Input
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    className="p-4 text-white bg-[#2a2b3a] border border-[#8417ff] rounded-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white"
                    onClick={togglePassword}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <Button
                  className="p-4 bg-[#8417ff] w-1/2 mx-auto rounded-full"
                  onClick={handleLogin}
                >
                  Login
                </Button>
              </TabsContent>
              <TabsContent value="signup" className="flex flex-col gap-4">
                <Input
                  placeholder="Email"
                  type="email"
                  className="p-4 text-white bg-[#2a2b3a] border border-[#8417ff] rounded-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="relative">
                  <Input
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    className="p-4 text-white bg-[#2a2b3a] border border-[#8417ff] rounded-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white"
                    onClick={togglePassword}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    placeholder="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="p-4 text-white bg-[#2a2b3a] border border-[#8417ff] rounded-full"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white"
                    onClick={toggleConfirmPassword}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <Button
                  className="p-4 bg-[#8417ff] w-1/2 mx-auto rounded-full"
                  onClick={handleSignup}
                >
                  Signup
                </Button>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
