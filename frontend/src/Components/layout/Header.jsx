
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../../redux/actions/userActions";
import { toast } from "react-toastify";

import Search from "./Search";
import "../../App.css";

const Header = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const showSearch =
    location.pathname === "/" ||
    location.pathname.startsWith("/eats/stores/search/");

  const { user } = useSelector((state) => state.user);

  const { cartItems } = useSelector((state) => state.cart);

  // Logout Handler
  const logoutHandler = async (e) => {
    e.preventDefault();

    const result = await dispatch(logout());

    if (result) {
      toast.success("Logged out successfully");
    } else {
      toast.error("Unable to logout");
    }
  };

  return (
    <>
      <nav className="navbar row sticky-top">

        {/* Logo */}
        <div className="col-12 col-md-3">
          <Link to="/">
            <img
              src="/images/logo.webp"
              alt="logo"
              className="logo"
            />
          </Link>
        </div>

        {/* Search */}
        <div className="col-12 col-md-6 mt-2 mt-md-0">
          {showSearch && <Search />}
        </div>

        {/* Right Side */}
        <div className="col-12 col-md-3 mt-4 mt-md-0 text-center">

          {/* Cart */}
          <Link to="/cart" style={{ textDecoration: "none" }}>
            <span className="ml-3" id="cart">
              Cart
            </span>

            <span className="ml-1" id="cart_count">
              {cartItems.length}
            </span>
          </Link>

          {/* Logged In User */}
          {user ? (
            <div className="ml-4 dropdown d-inline">

              <button
                type="button"
                className="btn dropdown-toggle text-white mr-4"
                id="dropDownMenuButton"
                data-toggle="dropdown"
              >
                <figure className="avatar avatar-nav">
                  <img
                    src={
                      user?.avatar?.url ||
                      "/images/default-avatar.png"
                    }
                    alt={user?.name || "User"}
                    className="rounded-circle"
                  />
                </figure>

                <span>{user?.name}</span>
              </button>

              <div className="dropdown-menu">

                <Link
                  className="dropdown-item"
                  to="/eats/orders/me/myOrders"
                >
                  Orders
                </Link>

                <Link
                  className="dropdown-item"
                  to="/users/me"
                >
                  Profile
                </Link>

                <button
                  type="button"
                  className="dropdown-item text-danger"
                  onClick={logoutHandler}
                >
                  Logout
                </button>

              </div>
            </div>
          ) : (

            /* Always Visible Login Button */
            <Link
  to="/users/login"
  className="btn ml-4"
  id="login_btn"
>
  Login
</Link>

          )}

        </div>
      </nav>
    </>
  );
};

export default Header;
