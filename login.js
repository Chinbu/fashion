async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if(!email || !password) {
    alert("Please enter both email and password");
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Login Failed: " + error.message);
    return;
  }

  alert("Login Successful! Welcome Admin 👋");
  window.location.href = "admin.html";
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if(savedTheme === 'dark') {
    document.body.classList.add('dark');
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

initTheme();