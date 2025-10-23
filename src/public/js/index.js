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
        const book = document.createElement('div');
        book.classList.add('book');
        const leftSpacer = document.createElement('div');
        leftSpacer.classList.add('left-spacer');
        book.append(leftSpacer);
        const center = document.createElement('div');
        center.classList.add('center');
        const title = document.createElement('p');
        title.textContent = element.title;
        center.append(title);
        const author = document.createElement('p');
        author.textContent = element.author;
        center.append(author);
        book.append(center);
        const rightSpacer = document.createElement('div');
        rightSpacer.classList.add('right-spacer');
        book.append(rightSpacer);
        li.append(book);
        recommendedList.append(li);
      });
    }
  }
  catch(error) {
    alert("Unable to load recommended list!");
  }
});
