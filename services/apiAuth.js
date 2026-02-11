export const loginApi = async (username, password) => {
  try {
    const response = await fetch("http://localhost:8080/backend/api/auth/login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password
      }),
    });

    const data = await response.json();

    if (data.status === "success") {
      return { success: true, data: data.user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: "Erreur de connexion au serveur" };
  }
};
