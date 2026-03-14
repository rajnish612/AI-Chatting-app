import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../lib/axios";
import { useNavigate } from "react-router-dom";
interface credentials {
  email?: string;
  password?: string;
}
const SignIn = () => {
  const navigate = useNavigate();
  const context = useAuth();

  const [credentials, setCredentials] = React.useState<credentials>({
    email: "",
    password: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof credentials;
    const value: string = e.target.value;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };
  const handleSignIn = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/auth/sign-in", credentials);
      if (res.data.success == true) {
        navigate("/sign-in");
      }
    } catch (err) {
      alert(err.response.data.message);
    }
  };
  return (
    <div className="min-h-screen bg-slate-100 w-full flex justify-center items-center">
      <div className="max-w-xl bg-white shadow-md rounded-lg flex flex-col gap-4 justify-start items-center p-4 w-full">
        <h1>Welcome Back!</h1>
        <p>Log in to your account</p>
        <form
          onSubmit={handleSignIn}
          className="flex w-full flex-col gap-4 p-2 justify-center items-start"
        >
          <div className="flex flex-col  w-full justify-center items-start  gap-2">
            <label htmlFor="email">Email</label>
            <div className="border  w-full border-gray-200 p-2 rounded-lg">
              <input
                onChange={handleChange}
                id="email"
                type="text"
                name="email"
                placeholder="John@gmail.com"
              />
            </div>
          </div>
          <div className="flex flex-col  w-full justify-center items-start  gap-2">
            <label htmlFor="password">Password</label>
            <div className="border  w-full border-gray-200 p-2 rounded-lg">
              <input
                onChange={handleChange}
                id="password"
                type="text"
                name="password"
                placeholder="p****"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-400 py-2 px-1 rounded-lg text-white text-md font-medium w-full"
          >
            submit
          </button>
          <div className="flex  w-full justify-center items-center  gap-2">
            <span>Already have an account?</span>{" "}
            <Link to={"/signup"} className="underline text-blue-400">
              signin
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
