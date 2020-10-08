//VARIABLE
const courses = document.querySelector('#courses-list'),
    shoppingCartContent = document.querySelector('#shopping-cart tbody'),
    clearCartBtn = document.querySelector('#clear-cart');




//EVENT LISTERNERS
loadEventListerners();
//So we are saying that JS should listen for any click event within the element in the handle
function loadEventListerners() {
    courses.addEventListener('click', buyCourse);
    shoppingCartContent.addEventListener('click', removeCourse);
    //Clear Cart Button
    clearCartBtn.addEventListener('click', clearCart);
    //Document Ready
    document.addEventListener('DOMContentLoaded', getFromLocalStorage);
}


//FUNCTIONS
function buyCourse(e) {


    if (e.target.classList.contains('add-to-cart')) {
        e.preventDefault();
        const course = e.target.parentElement.parentElement;
        //console.log(course);
        console.log(getCourseInfo(course));
    }
}

//Function to get all the info of the clicked course and put it in an object. Param course is the HTML container for
//the clicked course
function getCourseInfo(course) {
    const courseInfo = {
        image: course.querySelector('img').src,
        title: course.querySelector('h4').textContent,
        price: course.querySelector('.price span').textContent,
        id: course.querySelector('a').getAttribute('data-id')
    }

    //Insert course info object into shopping cart
    addIntoCart(courseInfo);
}

function addIntoCart(courseObj) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <tr>
            <td><img src="${courseObj.image}" width=100></td>
            <td>${courseObj.title}</td>
            <td>${courseObj.price}</td>
            <td><a href="#" class="remove" data-id="${courseObj.id}">X</a></td>
        </tr>
    `;

    shoppingCartContent.appendChild(row);

    //Also Add Course Into Local Storage
    saveCourseIntoStorage(courseObj);
}

function saveCourseIntoStorage(course) {
    let coursesLS = getCourseFromStorage();
    coursesLS.push(course);
    localStorage.setItem('courses', JSON.stringify(coursesLS));
}

//Function to READ all the cousrse in storage and convert them to an array or return an empty array
//If Local Storage is empty
function getCourseFromStorage() {
    let courses;
    if (localStorage.getItem('courses') === null) {
        courses = [];
    } else {
        courses = JSON.parse(localStorage.getItem('courses')); //convert string from LS to array
    }
    return courses;
}

//REMOVE COURSE FROM DOM
function removeCourse(e) {
    let courseId, course;
    if (e.target.classList.contains('remove')) {
        e.target.parentElement.parentElement.remove();
        course = e.target.parentElement.parentElement;
        courseId = course.querySelector('a').getAttribute('data-id');
        console.log(courseId);

        removeCourseLocalStorage(courseId);
    }
}

//Function to remove course from Local Storage
function removeCourseLocalStorage(courseId) {
    let coursesLS = getCourseFromStorage();
    coursesLS.forEach(function(course, index) {
        if (courseId === course.id) {
            coursesLS.splice(index, 1)
        }
    });
    localStorage.setItem('courses', JSON.stringify(coursesLS));
}

//Function to load added course to cart when page is reloaded
function getFromLocalStorage() {
    let courses = getCourseFromStorage();
    courses.forEach(function(course) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <tr>
                <td><img src="${course.image}" width=100></td>
                <td>${course.title}</td>
                <td>${course.price}</td>
                <td><a href="#" class="remove" data-id="${course.id}">X</a></td>
            </tr>
        `;

        shoppingCartContent.appendChild(row);
    });
}

//Function to clear cart DOM on click of clear cart button
function clearCart() {
    //so we while loop to see if the shopping cart body has a firstChild, if true we remove it's first child
    while (shoppingCartContent.firstChild) {
        shoppingCartContent.removeChild(shoppingCartContent.firstChild);
    }

    //Clear all courses in Local Storage
    localStorage.clear();



    // //so we check if the shopping cart body has a firstChild, if true we remove it's first child
    //If() condition would only check & remove on child at a time
    // if (shoppingCartContent.firstChild) {
    //     shoppingCartContent.removeChild(shoppingCartContent.firstChild);
    // }
}