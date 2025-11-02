import React, { useState, useEffect } from "react";

const VerificationScreen = ({
  verificationCode,
  handleCodeChange,
  handleResend,
}) => {
  const [isDisabled, setIsDisabled] = useState(true); 


  useEffect(() => {
    if (verificationCode.every((digit) => digit !== "")) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [verificationCode]);

  const handleResendClick = () => {
    handleResend();
    setIsDisabled(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      <h2 className="text-4xl font-semibold mb-3 text-gray-900">
        Verify Your Email
      </h2>
      <p className="text-gray-500 text-sm mb-10 text-center w-80">
        Please enter the verification code sent to your Email.
      </p>

     
      <div className="flex justify-center gap-4 mb-14">
        {verificationCode.map((digit, i) => (
          <input
            key={i}
            id={`code-input-${i}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleCodeChange(i, e.target.value)}
            className="w-12 h-12 text-center text-lg border border-gray-300 rounded-xl 
                       focus:ring-2 focus:ring-blue-400 focus:border-blue-400 
                       outline-none transition-all duration-200 bg-white/60 
                       hover:border-blue-300"
          />
        ))}
      </div>

      <button
        onClick={handleResendClick}
        disabled={isDisabled}
        className={`w-64 py-3 rounded-xl font-medium transition-all duration-300
          ${
            isDisabled
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-600 active:scale-95"
          }`}
      >
        Resend Code
      </button>

      <p className="text-xs text-gray-400 mt-5">
        Didn’t receive it? Check your spam folder.
      </p>
    </div>
  );
};

export default VerificationScreen;
