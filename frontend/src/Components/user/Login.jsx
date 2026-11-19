
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Loader from "../layout/Loader";
import { useDispatch, useSelector } from "react-redux";

import { login } from "../../redux/actions/userActions";
import { clearErrors } from "../../redux/slices/userSlice";

import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Login successful");
      navigate("/", { replace: true });
    }

    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, isAuthenticated, error, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter email and password");
      return;
    }

    await dispatch(login(email.trim(), password));
  };

  return (
    <div className="row wrapper justify-content-center">
      <div className="col-10 col-lg-5">

        <form className="shadow-lg" onSubmit={submitHandler}>
          <h1 className="mb-3">Login</h1>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <Link
            to="/users/forgetPassword"
            className="float-right mb-4"
          >
            Forgot Password?
          </Link>

          <button
            type="submit"
            className="btn btn-block py-3"
            disabled={loading}
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>

          <Link
            to="/users/signup"
            className="float-right mt-3"
          >
            NEW USER?
          </Link>

        </form>
      </div>
    </div>
  );
};

export default Login;
