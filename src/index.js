// It might be a good idea to add event listener to make sure this file
// only runs after the DOM has finshed loading.

const quoteURL = "http://localhost:3000/quotes";
const quoteLikeURL = "http://localhost:3000/quotes?_embed=likes";
const likeURL = "http://localhost:3000/likes";

const quoteList = document.querySelector("#quote-list");
const createForm = document.querySelector("#new-quote-form");
const createButton = document.querySelector("#create-button");

const fetchData = () => {
  return fetch(quoteLikeURL).then(resp => resp.json());
};

const fetchLikes = () => {
  return fetch(likeURL).then(resp => resp.json());
};

const showQuotes = () => {
  return fetchData().then(quotes =>
    quotes.forEach(quote => displayQuotes(quote))
  );
};

const deleteQuote = e => {
  const id = e.target.dataset.id;
  fetch(quoteURL + `/${id}`, { method: "DELETE" });
  deleteQuoteItem(id);
  fetchLikes().then(likes => removeLikes(likes, id));
};

const deleteQuoteItem = id => {
  const li = document.querySelector(`li[data-id='${id}']`);
  quoteList.removeChild(li);
};

const removeLikes = (likes, id) => {
  const likesArray = likes.filter(like => like.quoteId === id);
  likesArray.forEach(like =>
    fetch(quoteURL + `/${like.id}`, { method: "DELETE" })
  );
};

const likeQuote = e => {
  const id = e.target.dataset.id;
  const data = {
    quoteId: parseInt(id, 10),
    createdAt: +Date.now()
  };
  const postData = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  };
  fetch(likeURL, postData)
    .then(resp => resp.json())
    .then(likes => updateLikes(likes));
};

const updateLikes = likes => {
  const id = parseInt(likes.quoteId, 10);
  const span = document
    .querySelector(`li[data-id='${id}']`)
    .querySelector("span");
  span.innerText++;
};

const createQuote = e => {
  e.preventDefault();
  const newQuote = document.querySelector("#new-quote");
  const author = document.querySelector("#author");
  const data = {
    quote: newQuote.value,
    author: author.value
  };
  const postData = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  };
  // send new quote to quote builder function
  fetch(quoteURL, postData)
    .then(resp => resp.json())
    .then(quote => displayQuotes(quote));
  // clear entered text from form after submission
  newQuote.value = "";
  author.value = "";
};

const showHideEditForm = e => {
  const id = e.target.dataset.id;
  const form = document.querySelector(`form[data-id='${id}']`);
  !form ? editFormCreator(id) : form.parentElement.removeChild(form);
};

const editQuoteContent = e => {
  e.preventDefault();
  const id = e.target.dataset.id;
  const li = document.querySelector(`li[data-id='${id}']`);
  const form = li.querySelector(".edit-form");
  const inputAuthor = document.querySelector(`.edit-author`);
  const inputQuote = document.querySelector(`.edit-quote`);

  const currentAuthor = document
    .querySelector(`li[data-id='${id}']`)
    .querySelector(".blockquote-footer");
  const currentQuote = document
    .querySelector(`li[data-id='${id}']`)
    .querySelector("p");

  const newAuthor =
    inputAuthor.value.length != 0 ? inputAuthor.value : currentAuthor.innerText;
  const newQuote =
    inputQuote.value.length != 0 ? inputQuote.value : currentQuote.innerText;

  const data = {
    quote: newQuote,
    author: newAuthor
  };
  const patchData = {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  };
  fetch(quoteURL + `/${id}`, patchData);
  currentAuthor.innerText = newAuthor;
  currentQuote.innerText = newQuote;
  li.removeChild(form);
};

const displayQuotes = quote => {
  // create li element
  const li = document.createElement("li");
  li.className = "quote-card";
  li.dataset.id = quote.id;

  // create blockquote element
  const blockQuote = document.createElement("blockquote");
  blockQuote.className = "blockquote";

  // create p element
  const p = document.createElement("p");
  p.className = "mb-0";
  p.innerText = `${quote.quote}`;

  // create footer element
  const footer = document.createElement("footer");
  footer.className = "blockquote-footer";
  footer.innerText = `${quote.author}`;

  // create br element
  const br = document.createElement("br");

  // create like button element
  const likeButton = document.createElement("button");
  likeButton.className = "btn btn-success"; //green
  likeButton.innerText = "Likes: ";

  const span = document.createElement("span");
  span.innerText = quote.likes.length;
  likeButton.append(span);
  likeButton.dataset.id = quote.id;
  likeButton.addEventListener("click", likeQuote);

  // create delete element
  const deleteButton = document.createElement("button");
  deleteButton.className = "btn btn-danger"; // red
  deleteButton.innerText = "Delete";
  deleteButton.dataset.id = quote.id;
  deleteButton.addEventListener("click", deleteQuote);

  const editButton = document.createElement("button");
  editButton.className = "btn btn-primary"; // blue
  editButton.innerText = "Edit";
  editButton.dataset.id = quote.id;
  editButton.addEventListener("click", showHideEditForm);

  blockQuote.append(p, footer, br, likeButton, deleteButton, editButton);
  li.append(blockQuote);

  quoteList.append(li);
};

const editFormCreator = id => {
  const li = document.querySelector(`li[data-id='${id}']`);

  const editForm = document.createElement("form");
  editForm.className = "edit-form";
  editForm.dataset.id = id;
  const editQuote = document.createElement("input");
  editQuote.setAttribute("Placeholder", "Edit Quote");
  editQuote.className = "edit-quote";

  const editAuthor = document.createElement("input");
  editAuthor.setAttribute("Placeholder", "Edit Author");
  editAuthor.className = "edit-author";

  const editSubmit = document.createElement("button");
  editSubmit.innerText = "Update Quote!";
  editSubmit.className = "btn btn-light";
  editSubmit.dataset.id = id;

  editSubmit.addEventListener("click", editQuoteContent);

  editForm.append(editQuote, editAuthor, editSubmit);
  li.append(editForm);
};

const sortButton = () => {
  const headerContainer = document.querySelector("#header-container");
  const options = ["Ascending", "Descending"];
  const select = document.createElement("select");

  select.id = "sort-items";
  headerContainer.appendChild(select);

  for (var i = 0; i < options.length; i++) {
    let opt = document.createElement("option");
    opt.value = options[i];
    opt.innerText = options[i];
    select.appendChild(opt);
  }
};

const sortItems = e => {
  const sortValue = e.target.value;
  const sortQuery = "&_sort=author";
  const sortByQuery = { Ascending: "&_order=asc", Descending: "&_order=desc" };
  //   console.log(quoteLikeURL + sortQuery + sortByQuery[sortValue]);
  quoteList.innerHTML = "";
  return fetch(quoteLikeURL + sortQuery + sortByQuery[sortValue])
    .then(resp => resp.json())
    .then(quotes => quotes.forEach(quote => displayQuotes(quote)));
};


showQuotes();
sortButton();

createForm.addEventListener("submit", createQuote);
const selectSorter = document.querySelector("#sort-items");

selectSorter.addEventListener("change", sortItems);
createButton.addEventListener("click", sortItems);

