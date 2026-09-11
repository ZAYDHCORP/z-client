export const getPasswordStrength = (password: string) => {
  if (!password) {
    return { score: 0, label: "", hint: "" };
  }

  const hasMinLength = password.length >= 8;
  const hasRecommendedLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  let score = 1;

  if (hasMinLength && (hasUppercase || hasLowercase) && (hasNumber || hasSymbol)) {
    score = 2;
  }

  if (hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSymbol) {
    score = 3;
  }

  if (hasRecommendedLength && hasUppercase && hasLowercase && hasNumber && hasSymbol) {
    score = 4;
  }

  const levels = [
    { label: "Weak", hint: "Does not meet recommended security requirements." },
    { label: "Fair", hint: "Increase password length and complexity." },
    { label: "Good", hint: "Consider using 12 or more characters." },
    { label: "Strong", hint: "Meets recommended security standards." },
  ];

  return {
    score,
    label: levels[score - 1].label,
    hint: levels[score - 1].hint,
  };
};
