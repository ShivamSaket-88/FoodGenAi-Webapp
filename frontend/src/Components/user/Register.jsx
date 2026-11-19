
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { register } from "../../redux/actions/userActions";
import { clearErrors } from "../../redux/slices/userSlice";

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phoneNumber: "",
  });

  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(
    "/images/images.png"
  );

  const {
    name,
    email,
    password,
    passwordConfirm,
    phoneNumber,
  } = user;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, error, loading } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }

    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, isAuthenticated, error, navigate]);

  const onChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5 MB.");
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        setAvatarPreview(reader.result);
        setAvatar(reader.result);
      };

      reader.readAsDataURL(file);
    } else {
      setUser((previousUser) => ({
        ...previousUser,
        [e.target.name]: e.target.value,
      }));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phoneNumber.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== passwordConfirm) {
      toast.error("Passwords do not match.");
      return;
    }

    const userData = {
      name: name.trim(),
      email: email.trim(),
      password,
      passwordConfirm,
      phoneNumber: phoneNumber.trim(),
      avatar: avatar || "/images/images.png",
    };

    await dispatch(register(userData));
  };

  return (
    <div className="row wrapper">
      <div className="col-10 col-lg-5">
        <form
          className="shadow-lg"
          onSubmit={submitHandler}
          encType="multipart/form-data"
        >
          <h1 className="mb-3">Register</h1>

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={name}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={email}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              className="form-control"
              value={phoneNumber}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={password}
              onChange={onChange}
              minLength="8"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm">Confirm Password</label>
            <input
              type="password"
              id="passwordConfirm"
              name="passwordConfirm"
              className="form-control"
              value={passwordConfirm}
              onChange={onChange}
              minLength="8"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="avatar">Profile Picture</label>

            <div className="d-flex align-items-center">
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginRight: "15px",
                }}
              />

              <input
                type="file"
                id="avatar"
                name="avatar"
                className="form-control"
                accept="image/*"
                onChange={onChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-block py-3"
            disabled={loading}
          >
            {loading ? "CREATING ACCOUNT..." : "REGISTER"}
          </button>

          <div className="mt-3 text-center">
            <Link to="/users/login">Already have an account? Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
