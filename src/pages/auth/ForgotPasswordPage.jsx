import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { accountServices } from "../../services/accountServices";

const RESEND_SECONDS = 60;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSendOTP = async (data, event) => {
    event?.preventDefault();
    setIsLoading(true);
    try {
      const dataEmail = data.email.trim();
      await accountServices.sendOTP(dataEmail);
      setEmail(dataEmail);
      toast.success("Đã gửi mã OTP đến email của bạn.");
      setStep("otp");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Gửi OTP thất bại. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputsRef = useRef([]);
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const otp = useMemo(() => otpDigits.join(""), [otpDigits]);

  const focusAt = (i) => {
    const el = inputsRef.current[i];
    if (el) el.focus();
  };

  const handleChangeDigit = (i, val) => {
    const v = (val || "").replace(/\D/g, "");
    if (!v) {
      setOtpDigits((d) => {
        const c = [...d];
        c[i] = "";
        return c;
      });
      return;
    }
    if (v.length > 1) {
      const sliced = v.slice(0, 6);
      setOtpDigits((d) => {
        const c = [...d];
        for (let k = 0; k < 6; k++) c[k] = sliced[k] || "";
        return c;
      });
      focusAt(Math.min(sliced.length, 6) - 1);
      return;
    }
    setOtpDigits((d) => {
      const c = [...d];
      c[i] = v;
      return c;
    });
    if (i < 5 && v) focusAt(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      if (!otpDigits[i] && i > 0) {
        focusAt(i - 1);
        setOtpDigits((d) => {
          const c = [...d];
          c[i - 1] = "";
          return c;
        });
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      focusAt(i - 1);
    } else if (e.key === "ArrowRight" && i < 5) {
      focusAt(i + 1);
    } else if (e.key === "Enter") {
      if (otp.length === 6) onConfirmOTP();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text");
    const digits = (text || "").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    e.preventDefault();
    setOtpDigits((d) => {
      const c = [...d];
      for (let k = 0; k < 6; k++) c[k] = digits[k] || "";
      return c;
    });
    focusAt(Math.min(digits.length, 6) - 1);
  };

  const onConfirmOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 số OTP.");
      return;
    }
    setIsLoading(true);
    try {
      await accountServices.confirmOTP({ email, otp });
      toast.success("Xác thực thành công. Mật khẩu mới đã được gửi tới email của bạn. Vui lòng đăng nhập và đổi lại mật khẩu!");
      navigate("/auth/login");
    } catch (err) {
        console.log("err: ", err)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Xác thực OTP thất bại. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    try {
      await accountServices.sendOTP(email);
      toast.success("Đã gửi lại OTP.");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Gửi lại OTP thất bại.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại
            </button>

            <Link
              to="/auth/login"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Đăng nhập
            </Link>
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div onClick={() => navigate("/")} className="cursor-pointer">
                <h2 className="text-3xl font-bold text-gray-900">
                  Festival Hub
                </h2>
                <p className="text-sm text-gray-600">
                  Khôi phục quyền truy cập
                </p>
              </div>
            </div>

            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              {step === "email" ? "Quên mật khẩu" : "Xác thực OTP"}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === "email"
                ? "Nhập email để nhận mã OTP xác thực."
                : `Nhập mã OTP gồm 6 chữ số đã gửi đến: `}
              {step === "otp" && (
                <span className="font-medium text-gray-900">{email}</span>
              )}
            </p>
          </div>

          <div className="mt-8">
            {step === "email" ? (
              <form className="space-y-6" onSubmit={handleSubmit(onSendOTP)}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Gửi OTP"
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã xác thực (6 số)
                  </label>
                  <div
                    className="flex items-center justify-between gap-2"
                    onPaste={handlePaste}
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input
                        key={i}
                        ref={(el) => (inputsRef.current[i] = el)}
                        value={otpDigits[i]}
                        onChange={(e) => handleChangeDigit(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={1}
                        className="w-12 h-12 text-center text-xl font-semibold tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        aria-label={`OTP digit ${i + 1}`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Mẹo: bạn có thể dán (Ctrl/⌘+V) toàn bộ 6 số vào một ô.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Thay đổi email
                  </button>

                  <button
                    type="button"
                    disabled={cooldown > 0 || isLoading}
                    onClick={onResend}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                  >
                    {cooldown > 0
                      ? `Gửi lại OTP (${cooldown}s)`
                      : "Gửi lại OTP"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onConfirmOTP}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full flex justify-center py-2 px-4 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Xác thực"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative h-full flex items-center justify-center p-12">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-6">
                Bảo mật tài khoản của bạn
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Xác thực OTP nhanh chóng, an toàn và thuận tiện
              </p>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Bước 1</h3>
                  <p className="opacity-80">Nhập email để nhận mã OTP</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Bước 2</h3>
                  <p className="opacity-80">Nhập OTP & xác thực</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Hoàn tất</h3>
                  <p className="opacity-80">Quay lại đăng nhập an toàn</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Hỗ trợ</h3>
                  <p className="opacity-80">Liên hệ nếu không nhận được mail</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
