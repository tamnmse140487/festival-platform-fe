import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, School, Mail, Lock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { ROLE_NAME } from "../../utils/constants";
import { getGoogleIdTokenWithPopup } from "../../config/configFirebase";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submittingGoogle, setSubmittingGoogle] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const routeByRole = (role) => {
    switch (role) {
      case ROLE_NAME.STUDENT:
      case ROLE_NAME.TEACHER:
      case ROLE_NAME.USER:
        navigate("/app/festivals");
        break;
      default:
        navigate("/app/dashboard");
        break;
    }
  };

  const onSubmit = async (data, event) => {
    event?.preventDefault();

    setIsLoading(true);
    try {
      const result = await login(data);

      if (result.success) {
        toast.success("Đăng nhập thành công!");

        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        routeByRole(storedUser?.role);
      } else {
        toast.error(result.error || "Đăng nhập thất bại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setSubmittingGoogle(true);
    try {
      const idToken = await getGoogleIdTokenWithPopup();

      const result = await loginWithGoogle({ token: idToken });
      if (result.success) {
        toast.success("Đăng nhập Google thành công!");
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        routeByRole(storedUser?.role);
      } else {
        toast.error(result.error || "Đăng nhập Google thất bại");
      }
    } catch (err) {
      if (err?.code !== "auth/popup-closed-by-user") {
        console.error(err);
        toast.error("Không thể đăng nhập bằng Google.");
      }
    } finally {
      setSubmittingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <School className="w-7 h-7 text-white" />
              </div>
              <div onClick={() => navigate("/")} className="cursor-pointer">
                <h2 className="text-3xl font-bold text-gray-900">
                  Festival Hub
                </h2>
                <p className="text-sm text-gray-600">Hệ thống quản lý lễ hội</p>
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              Đăng nhập vào tài khoản
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("email", {
                      required: "Email là bắt buộc",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Email không hợp lệ",
                      },
                    })}
                    type="email"
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập email của bạn"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mật khẩu
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("password", {
                      required: "Mật khẩu là bắt buộc",
                      minLength: {
                        value: 6,
                        message: "Mật khẩu phải có ít nhất 6 ký tự",
                      },
                    })}
                    type={showPassword ? "text" : "password"}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/auth/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </div>
            </form>

            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="px-3 text-gray-500 text-sm">Hoặc</span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={onGoogleSignIn}
                disabled={submittingGoogle}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer border border-gray-200"
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  className="w-4 h-4 mr-3"
                />
                {submittingGoogle ? "Đang xử lý..." : "Đăng nhập với Google"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative h-full flex items-center justify-center p-12">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-6">
                Chào mừng đến với Festival Hub
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Hệ thống quản lý lễ hội toàn diện cho các trường học
              </p>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Quản lý Festival</h3>
                  <p className="opacity-80">
                    Tạo và quản lý các lễ hội một cách dễ dàng
                  </p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Kết nối trường học</h3>
                  <p className="opacity-80">
                    Kết nối các trường tham gia cùng nhau
                  </p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Quản lý gian hàng</h3>
                  <p className="opacity-80">
                    Theo dõi và quản lý các gian hàng hiệu quả
                  </p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Hệ thống điểm thưởng</h3>
                  <p className="opacity-80">
                    Tích lũy điểm qua mini games thú vị
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
