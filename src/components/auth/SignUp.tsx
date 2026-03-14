import React from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../lib/axios";
import { useAuth } from "../../hooks/useAuth";
interface credentials {
  fullname?: string;
  email?: string;
  password?: string;
}
const SignUp = () => {
  const context = useAuth();
  const [credentials, setCredentials] = React.useState<credentials>({
    fullname: "",
    email: "",
    password: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof credentials;
    const value: string = e.target.value;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };
  const handleSignUp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/auth/sign-up", credentials);
    } catch (err) {
      alert(err.response.data.message);
    }
  };
  if (!context) return;
  const { error, loading, me } = context;
  if (error) {
    // alert(error);
  }

  return (
    <div className="min-h-screen bg-slate-100 w-full flex justify-center items-center">
      <div className="max-w-xl bg-white shadow-md rounded-lg flex flex-col gap-4 justify-start items-center p-4 w-full">
        <h1>Create Account</h1>
        <p>Get started with your free account</p>

        <form
          onSubmit={handleSignUp}
          className="flex w-full flex-col gap-4 p-2 justify-center items-start"
        >
          <div className="flex flex-col w-full justify-center items-start gap-2">
            <label htmlFor="fullName">Full Name</label>
            <div className="border w-full border-gray-200 p-2 rounded-lg">
              {" "}
              <input
                onChange={handleChange}
                className="w-full"
                id="fullName"
                type="text"
                name="fullName"
                placeholder="John Doe"
              />
            </div>
          </div>
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
                name="email"
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
            <Link to={"/signin"} className="underline text-blue-400">
              signin
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
