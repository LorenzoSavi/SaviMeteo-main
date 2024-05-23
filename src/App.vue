<template>
  <div id="app">
    <nav>
      <ul>
        <li><router-link to="/">Temperature</router-link></li>
        <li><router-link to="/precipitation">Precipitazioni</router-link></li>
      </ul>
    </nav>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body {
  font-family: 'Arial', sans-serif;
  background-color: #f5f5f5;
  margin: 0;
  padding: 0;
}
nav {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
nav ul {
  list-style-type: none;
  padding: 0;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
nav li {
  display: inline;
}
nav a {
  text-decoration: none;
  color: #42b983;
  font-weight: bold;
  padding: 10px 20px;
  border: 2px solid #42b983;
  border-radius: 5px;
  transition: background-color 0.3s, color 0.3s;
}
nav a:hover {
  background-color: #42b983;
  color: white;
}
.content {
  margin: 40px auto;
  width: 90%;
  max-width: 1200px;
  background-color: white;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
h1 {
  text-align: center;
  color: #333;
}

/* Media Queries for Responsive Design */
@media (max-width: 600px) {
  nav ul {
    flex-direction: column;
    align-items: center;
  }
  .content {
    width: 100%;
    margin: 20px auto;
    padding: 10px;
  }
  nav a {
    padding: 10px;
    font-size: 14px;
  }
}
</style>
