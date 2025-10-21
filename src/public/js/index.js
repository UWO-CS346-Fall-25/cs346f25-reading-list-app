// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function () {
  const token = document.getElementsByName("csrf-token")[0].getAttribute('content'); // csrf-token for security
  const recommendedList = document.getElementById("books");
  try {
    const response = await fetch('/recommended');
    const json = await response.json();
    if (json.success) {
      json.data.forEach(element => {
        const li = document.createElement('li');
        li.textContent = element.title + " : " + element.author;
        li.classList.add('book');
        recommendedList.append(li);
      });
    }
  }
  catch(error) {
    alert("Unable to load recommended list!");
  }
});
