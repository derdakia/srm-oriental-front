export const login = async (email, password) => {
  const response = await fetch("http://localhost:8080/api/auth/login.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return response.json();
};
