/* ==========================================================
   Musafir restaurant website: script.js
   This one file makes all pages dynamic.
   There is no server, so all data is saved in the browser
   using localStorage (it works like a small database).
   Keys used: menuItems, reservations, reviews, messages, users
   ========================================================== */


/* ---------- 1. Small helper functions ---------- */

// read an array from localStorage
function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// save an array into localStorage
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// stops users from typing html into our pages (safety)
function safe(text) {
  let d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

// next id for a new record (biggest id + 1)
function nextId(list) {
  let max = 0;
  for (let i = 0; i < list.length; i++) {
    if (list[i].id > max) max = list[i].id;
  }
  return max + 1;
}

// date as yyyy-mm-dd, n days from today
function dateFromToday(n) {
  let d = new Date();
  d.setDate(d.getDate() + n);
  let m = String(d.getMonth() + 1).padStart(2, '0');
  let day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}

// 2026-10-12 becomes 12 Oct
function showDate(iso) {
  let d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

// 19:30 becomes 7:30 pm
function showTime(t) {
  let parts = t.split(':');
  let h = parseInt(parts[0]);
  let ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  if (h == 0) h = 12;
  return h + ':' + parts[1] + ' ' + ampm;
}

// bootstrap badge colour for each status
function badge(status) {
  let colour = 'secondary';
  if (status == 'Pending' || status == 'New') colour = 'warning';
  if (status == 'Confirmed' || status == 'Approved') colour = 'success';
  if (status == 'Cancelled') colour = 'danger';
  return '<span class="badge text-bg-' + colour + '">' + status + '</span>';
}

// star icons for a rating like 4.6
function starsHtml(r) {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    if (r >= i) s += '<i class="bi bi-star-fill"></i>';
    else if (r >= i - 0.5) s += '<i class="bi bi-star-half"></i>';
    else s += '<i class="bi bi-star"></i>';
  }
  return s;
}


/* ---------- 2. Starting data (only saved the first time) ---------- */

function seedData() {
  // menu items: category, type, name, price, popular
  if (!localStorage.getItem('menuItems')) {
    let list = [
      ['Starters', 'Veg', 'Paneer tikka', 220, true],
      ['Starters', 'Veg', 'Spring roll', 150, false],
      ['Starters', 'Veg', 'Soup', 120, false],
      ['Starters', 'Non-veg', 'Tandoori', 280, false],
      ['Starters', 'Veg', 'Manchurian', 180, false],
      ['Starters', 'Veg', 'Fries', 110, false],
      ['Starters', 'Non-veg', 'Kebab', 260, false],
      ['Main course', 'Non-veg', 'Chicken biryani', 320, true],
      ['Main course', 'Non-veg', 'Butter chicken', 340, false],
      ['Main course', 'Veg', 'Paneer butter masala', 260, false],
      ['Main course', 'Veg', 'Veg biryani', 240, false],
      ['Main course', 'Veg', 'Dal tadka', 180, false],
      ['Main course', 'Veg', 'Special thali', 299, false],
      ['Main course', 'Veg', 'Punjabi thali', 280, false],
      ['Desserts', 'Veg', 'Gulab jamun', 90, true],
      ['Desserts', 'Veg', 'Ice cream', 100, false],
      ['Desserts', 'Veg', 'Brownie', 140, false],
      ['Desserts', 'Veg', 'Cheesecake', 170, false],
      ['Desserts', 'Veg', 'Chocolate cake', 160, false],
      ['Desserts', 'Veg', 'Rasmalai', 120, false],
      ['Drinks', 'Veg', 'Fresh juice', 90, false],
      ['Drinks', 'Veg', 'Cold coffee', 110, false],
      ['Drinks', 'Veg', 'Milkshake', 130, false],
      ['Drinks', 'Veg', 'Cappuccino', 120, false],
      ['Drinks', 'Veg', 'Mojito', 140, false],
      ['Drinks', 'Veg', 'Soft drink', 60, false]
    ];
    let items = [];
    for (let i = 0; i < list.length; i++) {
      items.push({
        id: i + 1,
        category: list[i][0],
        type: list[i][1],
        name: list[i][2],
        price: list[i][3],
        popular: list[i][4],
        photo: ''
      });
    }
    saveData('menuItems', items);
  }

  // one demo customer so we can test login quickly
  if (!localStorage.getItem('users')) {
    saveData('users', [{ name: 'Demo User', email: 'demo@musafir.com', password: '123456' }]);
  }

  if (!localStorage.getItem('reservations')) {
    saveData('reservations', [
      { id: 1, name: 'Aarav S.', phone: '9800000001', date: dateFromToday(1), time: '19:30', guests: 4, request: '', status: 'Pending', email: 'demo@musafir.com' },
      { id: 2, name: 'Meera P.', phone: '9800000002', date: dateFromToday(1), time: '20:00', guests: 2, request: '', status: 'Confirmed', email: 'meera@example.com' },
      { id: 3, name: 'Rohan K.', phone: '9800000003', date: dateFromToday(3), time: '13:00', guests: 3, request: '', status: 'Cancelled', email: 'rohan@example.com' }
    ]);
  }

  if (!localStorage.getItem('reviews')) {
    saveData('reviews', [
      { id: 1, name: 'Aarav S.', rating: 5, text: 'Best biryani in town.', status: 'Approved' },
      { id: 2, name: 'Meera P.', rating: 5, text: 'Lovely family dinner.', status: 'Approved' },
      { id: 3, name: 'Rohan K.', rating: 4, text: 'Great thali, quick booking.', status: 'Approved' },
      { id: 4, name: 'Dev T.', rating: 4, text: 'Nice food and good service.', status: 'New' }
    ]);
  }

  if (!localStorage.getItem('messages')) {
    saveData('messages', [
      { id: 1, name: 'Sana M.', email: 'sana@example.com', subject: 'Party booking', message: 'Hello, I want to book the restaurant for a birthday party of 25 people. Please tell me the details.', status: 'New' }
    ]);
  }
}


/* ---------- 3. Login state (customer and admin) ---------- */

function getCurrentUser() {
  let email = localStorage.getItem('currentUser');
  if (!email) return null;
  let users = getData('users');
  for (let i = 0; i < users.length; i++) {
    if (users[i].email == email) return users[i];
  }
  return null;
}

// navbar: show Logout and My reservations when a customer is logged in
function setupNavbar() {
  let link = document.getElementById('authLink');
  if (!link) return;
  let user = getCurrentUser();
  if (user) {
    link.textContent = 'Logout';
    link.href = '#';
    link.addEventListener('click', function (e) {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    });
    link.insertAdjacentHTML('beforebegin', '<a class="nav-link" href="my-reservations.html">My reservations</a>');
  }
}

function adminLogout() {
  sessionStorage.removeItem('adminLoggedIn');
  window.location.href = 'admin-login.html';
}


/* ---------- 4. Menu cards (home page and menu page) ---------- */

function itemCard(item) {
  let dot = item.type == 'Veg' ? 'veg' : 'nonveg';
  // photo uploaded by admin, otherwise the file images/menu/<item_name>.jpg
  // (example: Paneer tikka -> images/menu/paneer_tikka.jpg)
  let src = item.photo;
  if (!src) src = 'images/menu/' + item.name.toLowerCase().replace(/ /g, '_') + '.jpg';
  // if the .jpg is missing, onerror tries the .svg drawing, then the grey placeholder
  let photo = '<img src="' + src + '" class="card-img-top" style="height:140px;object-fit:cover" alt="' + safe(item.name) +
    '" onerror="if(!this.dataset.t){this.dataset.t=1;this.src=this.src.replace(\'.jpg\',\'.svg\')}else{this.onerror=null;this.src=\'images/placeholder.svg\'}">';
  return '<div class="col"><div class="card h-100">' + photo +
    '<div class="card-body"><h5 class="h6"><span class="' + dot + '"></span>' + safe(item.name) + '</h5>' +
    '<div class="text-m fw-bold">₹' + item.price + '</div></div></div></div>';
}

// home page: only items marked popular
function showPopular() {
  let box = document.getElementById('popularItems');
  if (!box) return;
  let items = getData('menuItems');
  let html = '';
  for (let i = 0; i < items.length; i++) {
    if (items[i].popular) html += itemCard(items[i]);
  }
  if (html == '') html = '<p>No popular items yet.</p>';
  box.innerHTML = html;
}

// menu page: fill each tab with its category
function showMenu() {
  let boxes = document.querySelectorAll('[data-category]');
  if (boxes.length == 0) return;
  let items = getData('menuItems');
  for (let b = 0; b < boxes.length; b++) {
    let html = '';
    for (let i = 0; i < items.length; i++) {
      if (items[i].category == boxes[b].dataset.category) html += itemCard(items[i]);
    }
    if (html == '') html = '<p class="text-center">No items in this category.</p>';
    boxes[b].innerHTML = html;
  }
}


/* ---------- 5. Customer pages ---------- */

// ----- login and sign up -----
function loginUser(e) {
  e.preventDefault();
  let f = e.target;
  let email = f.elements['email'].value.trim().toLowerCase();
  let password = f.elements['password'].value;
  let users = getData('users');
  for (let i = 0; i < users.length; i++) {
    if (users[i].email == email && users[i].password == password) {
      localStorage.setItem('currentUser', email);
      window.location.href = 'my-reservations.html';
      return;
    }
  }
  alert('Wrong email or password');
}

function signupUser(e) {
  e.preventDefault();
  let f = e.target;
  let name = f.elements['full_name'].value.trim();
  let email = f.elements['email'].value.trim().toLowerCase();
  let password = f.elements['password'].value;
  let users = getData('users');
  for (let i = 0; i < users.length; i++) {
    if (users[i].email == email) {
      alert('This email is already registered. Please login.');
      return;
    }
  }
  users.push({ name: name, email: email, password: password });
  saveData('users', users);
  localStorage.setItem('currentUser', email);
  alert('Account created. Welcome, ' + name + '!');
  window.location.href = 'my-reservations.html';
}

// ----- book a table -----
function setupBookForm() {
  let f = document.getElementById('bookForm');
  if (!f) return;
  let user = getCurrentUser();
  if (!user) {
    alert('Please login first to book a table.');
    window.location.href = 'login.html';
    return;
  }
  f.elements['name'].value = user.name;
  f.elements['date'].min = dateFromToday(0);   // cannot pick a past date
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    let list = getData('reservations');
    list.push({
      id: nextId(list),
      name: f.elements['name'].value.trim(),
      phone: f.elements['phone_number'].value,
      date: f.elements['date'].value,
      time: f.elements['time'].value,
      guests: parseInt(f.elements['number_of_guests'].value),
      request: f.elements['request'].value.trim(),
      status: 'Pending',
      email: user.email
    });
    saveData('reservations', list);
    alert('Table booked! The restaurant will confirm it soon.');
    window.location.href = 'my-reservations.html';
  });
}

// ----- my reservations -----
function showMyReservations() {
  let body = document.getElementById('myList');
  if (!body) return;
  let user = getCurrentUser();
  if (!user) {
    alert('Please login to see your reservations.');
    window.location.href = 'login.html';
    return;
  }
  let list = getData('reservations');
  let html = '';
  for (let i = list.length - 1; i >= 0; i--) {
    let r = list[i];
    if (r.email != user.email) continue;
    let action = '';
    if (r.status != 'Cancelled') {
      action = '<button class="btn btn-sm btn-outline-danger" onclick="cancelMyReservation(' + r.id + ')">Cancel</button>';
    }
    html += '<tr><td>' + showDate(r.date) + '</td><td>' + showTime(r.time) + '</td><td>' + r.guests +
      '</td><td>' + badge(r.status) + '</td><td>' + action + '</td></tr>';
  }
  if (html == '') html = '<tr><td colspan="5" class="text-center">You have no reservations yet.</td></tr>';
  body.innerHTML = html;
}

function cancelMyReservation(id) {
  if (!confirm('Cancel this reservation?')) return;
  let list = getData('reservations');
  for (let i = 0; i < list.length; i++) {
    if (list[i].id == id) list[i].status = 'Cancelled';
  }
  saveData('reservations', list);
  showMyReservations();
}

// ----- reviews -----
function showReviews() {
  let box = document.getElementById('reviewList');
  if (!box) return;
  let list = getData('reviews');
  let html = '';
  let total = 0;
  let count = 0;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].status != 'Approved') continue;   // only approved reviews are public
    total += list[i].rating;
    count++;
    html += '<div class="col"><div class="card p-3 h-100"><span class="text-warning">' + starsHtml(list[i].rating) +
      '</span><p class="mb-1">' + safe(list[i].text) + '</p><b class="text-m small">' + safe(list[i].name) + '</b></div></div>';
  }
  if (html == '') html = '<p class="text-center">No reviews yet. Be the first one!</p>';
  box.innerHTML = html;

  // average rating
  let avg = count > 0 ? total / count : 0;
  document.getElementById('avgNumber').textContent = avg.toFixed(1);
  document.getElementById('avgStars').innerHTML = starsHtml(avg);
  document.getElementById('avgCount').textContent = 'Based on ' + count + ' reviews';
}

function submitReview(e) {
  e.preventDefault();
  let f = e.target;
  let list = getData('reviews');
  list.push({
    id: nextId(list),
    name: f.elements['name'].value.trim(),
    rating: parseInt(f.elements['rating'].value),   // "5 stars" becomes 5
    text: f.elements['review'].value.trim(),
    status: 'New'
  });
  saveData('reviews', list);
  f.reset();
  alert('Thank you! Your review will be shown after admin approval.');
}

// ----- contact -----
function sendMessage(e) {
  e.preventDefault();
  let f = e.target;
  let list = getData('messages');
  list.push({
    id: nextId(list),
    name: f.elements['name'].value.trim(),
    email: f.elements['email'].value.trim(),
    subject: f.elements['subject'].value.trim(),
    message: f.elements['message'].value.trim(),
    status: 'New'
  });
  saveData('messages', list);
  f.reset();
  alert('Message sent. We will contact you soon.');
}


/* ---------- 6. Admin pages ---------- */

// ----- admin login (demo: email admin@musafir.com, password admin123) -----
function adminLogin(e) {
  e.preventDefault();
  let f = e.target;
  if (f.elements['email'].value.trim() == 'admin@musafir.com' && f.elements['password'].value == 'admin123') {
    sessionStorage.setItem('adminLoggedIn', 'yes');
    window.location.href = 'admin-dashboard.html';
  } else {
    alert('Wrong admin email or password');
  }
}

// ----- dashboard -----
function showDashboard() {
  if (!document.getElementById('statBookings')) return;
  let reservations = getData('reservations');
  let today = dateFromToday(0);
  let todayCount = 0;
  for (let i = 0; i < reservations.length; i++) {
    if (reservations[i].date == today) todayCount++;
  }
  let newMessages = 0;
  let messages = getData('messages');
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].status == 'New') newMessages++;
  }
  document.getElementById('statBookings').textContent = todayCount;
  document.getElementById('statMenu').textContent = getData('menuItems').length;
  document.getElementById('statMessages').textContent = newMessages;
  document.getElementById('statReviews').textContent = getData('reviews').length;

  // last 5 bookings
  let html = '';
  for (let i = reservations.length - 1; i >= 0 && i >= reservations.length - 5; i--) {
    let r = reservations[i];
    html += '<tr><td>' + safe(r.name) + '</td><td>' + showDate(r.date) + '</td><td>' + r.guests + '</td><td>' + badge(r.status) + '</td></tr>';
  }
  if (html == '') html = '<tr><td colspan="4" class="text-center">No bookings yet.</td></tr>';
  document.getElementById('recentList').innerHTML = html;
}

// ----- admin menu items (add, edit, delete) -----
let deleteId = 0;

function showAdminItems() {
  let body = document.getElementById('itemList');
  if (!body) return;
  let items = getData('menuItems');
  let html = '';
  for (let i = 0; i < items.length; i++) {
    let it = items[i];
    html += '<tr><td>' + safe(it.name) + '</td><td>' + it.category + '</td><td>₹' + it.price + '</td><td>' +
      '<button class="btn btn-sm btn-outline-warning" onclick="editItem(' + it.id + ')">Edit</button> ' +
      '<button class="btn btn-sm btn-outline-danger" data-bs-toggle="modal" data-bs-target="#del" onclick="askDelete(' + it.id + ')">Delete</button></td></tr>';
  }
  if (html == '') html = '<tr><td colspan="4" class="text-center">No menu items.</td></tr>';
  body.innerHTML = html;
}

function resetItemForm() {
  let f = document.getElementById('addForm');
  f.reset();
  f.elements['editId'].value = '';
}

function saveItem(e) {
  e.preventDefault();
  let f = e.target;
  let file = f.elements['photo'].files[0];
  if (file) {
    if (file.size > 200 * 1024) {
      alert('Photo is too big. Please choose a photo under 200 KB.');
      return;
    }
    let reader = new FileReader();
    reader.onload = function () { storeItem(f, reader.result); };
    reader.readAsDataURL(file);
  } else {
    storeItem(f, null);
  }
}

// photo is null when no new photo was chosen
function storeItem(f, photo) {
  let items = getData('menuItems');
  let id = f.elements['editId'].value;
  if (id) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id == id) {
        items[i].name = f.elements['item_name'].value.trim();
        items[i].category = f.elements['category'].value;
        items[i].price = parseInt(f.elements['price'].value);
        items[i].type = f.elements['type'].value;
        items[i].popular = f.elements['popular'].checked;
        if (photo) items[i].photo = photo;
      }
    }
  } else {
    items.push({
      id: nextId(items),
      name: f.elements['item_name'].value.trim(),
      category: f.elements['category'].value,
      price: parseInt(f.elements['price'].value),
      type: f.elements['type'].value,
      popular: f.elements['popular'].checked,
      photo: photo || ''
    });
  }
  try {
    saveData('menuItems', items);
  } catch (err) {
    alert('Browser storage is full. Use a smaller photo.');
    return;
  }
  resetItemForm();
  bootstrap.Collapse.getOrCreateInstance(document.getElementById('addForm')).hide();
  showAdminItems();
}

function editItem(id) {
  let items = getData('menuItems');
  let f = document.getElementById('addForm');
  for (let i = 0; i < items.length; i++) {
    if (items[i].id == id) {
      f.elements['editId'].value = id;
      f.elements['item_name'].value = items[i].name;
      f.elements['category'].value = items[i].category;
      f.elements['price'].value = items[i].price;
      f.elements['type'].value = items[i].type;
      f.elements['popular'].checked = items[i].popular;
    }
  }
  bootstrap.Collapse.getOrCreateInstance(f).show();
  f.scrollIntoView();
}

function askDelete(id) {
  deleteId = id;   // remember which item, the popup button will delete it
}

function confirmDelete() {
  let items = getData('menuItems');
  let left = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].id != deleteId) left.push(items[i]);
  }
  saveData('menuItems', left);
  showAdminItems();
}

// ----- admin reservations -----
function showAdminReservations() {
  let body = document.getElementById('resList');
  if (!body) return;
  let list = getData('reservations');
  let html = '';
  for (let i = list.length - 1; i >= 0; i--) {
    let r = list[i];
    let action = '-';
    if (r.status == 'Pending') {
      action = '<button class="btn btn-sm btn-m" onclick="changeStatus(' + r.id + ', \'Confirmed\')">Confirm</button> ' +
        '<button class="btn btn-sm btn-outline-danger" onclick="changeStatus(' + r.id + ', \'Cancelled\')">Cancel</button>';
    } else if (r.status == 'Confirmed') {
      action = '<button class="btn btn-sm btn-outline-danger" onclick="changeStatus(' + r.id + ', \'Cancelled\')">Cancel</button>';
    }
    html += '<tr><td>' + safe(r.name) + '</td><td>' + safe(r.phone) + '</td><td>' + showDate(r.date) + ', ' + showTime(r.time) +
      '</td><td>' + badge(r.status) + '</td><td>' + action + '</td></tr>';
  }
  if (html == '') html = '<tr><td colspan="5" class="text-center">No reservations yet.</td></tr>';
  body.innerHTML = html;
}

function changeStatus(id, status) {
  let list = getData('reservations');
  for (let i = 0; i < list.length; i++) {
    if (list[i].id == id) list[i].status = status;
  }
  saveData('reservations', list);
  showAdminReservations();
}

// ----- admin messages and reviews -----
function showAdminMessages() {
  let body = document.getElementById('msgList');
  if (!body) return;
  let list = getData('messages');
  let html = '';
  for (let i = list.length - 1; i >= 0; i--) {
    let m = list[i];
    html += '<tr><td>' + safe(m.name) + '</td><td>' + safe(m.subject) + '</td><td>' + badge(m.status) + '</td><td>' +
      '<button class="btn btn-sm btn-outline-warning" data-bs-toggle="modal" data-bs-target="#viewMsg" onclick="viewMessage(' + m.id + ')">View</button> ' +
      '<button class="btn btn-sm btn-outline-danger" onclick="deleteMessage(' + m.id + ')">Delete</button></td></tr>';
  }
  if (html == '') html = '<tr><td colspan="4" class="text-center">No messages.</td></tr>';
  body.innerHTML = html;
}

function viewMessage(id) {
  let list = getData('messages');
  for (let i = 0; i < list.length; i++) {
    if (list[i].id == id) {
      document.getElementById('msgTitle').textContent = list[i].subject;
      document.getElementById('msgBody').innerHTML = '<p>' + safe(list[i].message) + '</p>' +
        '<small class="text-secondary">From: ' + safe(list[i].name) + ' (' + safe(list[i].email) + ')</small>';
      list[i].status = 'Read';
    }
  }
  saveData('messages', list);
  showAdminMessages();
}

function deleteMessage(id) {
  if (!confirm('Delete this message?')) return;
  let list = getData('messages');
  let left = [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].id != id) left.push(list[i]);
  }
  saveData('messages', left);
  showAdminMessages();
}

function showAdminReviews() {
  let body = document.getElementById('adminReviewList');
  if (!body) return;
  let list = getData('reviews');
  let html = '';
  for (let i = list.length - 1; i >= 0; i--) {
    let r = list[i];
    let approve = '';
    if (r.status != 'Approved') {
      approve = '<button class="btn btn-sm btn-m" onclick="approveReview(' + r.id + ')">Approve</button> ';
    }
    html += '<tr><td>' + safe(r.name) + '<div class="small text-secondary">' + safe(r.text) + '</div></td><td>' + r.rating + ' stars</td><td>' +
      badge(r.status) + '</td><td>' + approve +
      '<button class="btn btn-sm btn-outline-danger" onclick="deleteReview(' + r.id + ')">Delete</button></td></tr>';
  }
  if (html == '') html = '<tr><td colspan="4" class="text-center">No reviews.</td></tr>';
  body.innerHTML = html;
}

function approveReview(id) {
  let list = getData('reviews');
  for (let i = 0; i < list.length; i++) {
    if (list[i].id == id) list[i].status = 'Approved';
  }
  saveData('reviews', list);
  showAdminReviews();
}

function deleteReview(id) {
  if (!confirm('Delete this review?')) return;
  let list = getData('reviews');
  let left = [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].id != id) left.push(list[i]);
  }
  saveData('reviews', left);
  showAdminReviews();
}


/* ---------- 7. Run everything when the page loads ---------- */

seedData();

// admin pages need the admin to be logged in
if (document.body.dataset.admin == 'yes' && !sessionStorage.getItem('adminLoggedIn')) {
  window.location.href = 'admin-login.html';
}

setupNavbar();
showPopular();
showMenu();
showReviews();
showMyReservations();
setupBookForm();
showDashboard();
showAdminItems();
showAdminReservations();
showAdminMessages();
showAdminReviews();

// connect forms to their functions (only if the form is on this page)
let forms = {
  loginForm: loginUser,
  signupForm: signupUser,
  reviewForm: submitReview,
  contactForm: sendMessage,
  adminLoginForm: adminLogin
};
for (let id in forms) {
  let form = document.getElementById(id);
  if (form) form.addEventListener('submit', forms[id]);
}
