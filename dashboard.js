import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore, query, where, collection, doc, setDoc, addDoc, getDoc, getDocs, orderBy, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA0SBKZ8NbGpGzD0rqD7A4OG6TJVeqYxJ0",
    authDomain: "fahrschule-sieber.firebaseapp.com",
    projectId: "fahrschule-sieber",
    storageBucket: "fahrschule-sieber.appspot.com",
    messagingSenderId: "102112916651",
    appId: "1:102112916651:web:1a633f589c6d62ae1c33ee",
    measurementId: "G-07JZZQK05B"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);



// KURSÜBERSICHT

async function loadCourseList() {
    let q = query(collection(db, "courses"), orderBy("__name__"));
    let querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        addCourseToList(doc.id, doc.data().type, doc.data().start, doc.data().end, doc.data().time, doc.data().places, doc.data().price, doc.data().teacher, doc.data().archived);
    });
}

let coursediv = document.getElementById("coursediv");
coursediv.innerHTML = "";

function addCourseToList(id, type, start, end, time, places, price, teacher, archived) {
    let newtype = "";
    if (type == "i") {
        newtype = "Intensivkurs";
    } else {
        newtype = "Ferienkurs";
    }
    if (archived == false) {
        if (places >= 1) {
            coursediv.innerHTML = ("<div class='dashboard-course background-color-grey padding-medium'><div class='w-layout-grid dashboard-course-item-grid'><div class='text-size-small text-weight-medium text-color-darkgrey'>" + id + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + newtype + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + start + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + end + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + time + " Uhr</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + places + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + price + "€</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + teacher + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>Plätze frei</div></div></div>" + coursediv.innerHTML);
        } else {
            coursediv.innerHTML = ("<div class='dashboard-course background-color-grey padding-medium'><div class='w-layout-grid dashboard-course-item-grid'><div class='text-size-small text-weight-medium text-color-darkgrey'>" + id + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + newtype + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + start + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + end + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + time + " Uhr</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + places + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + price + "€</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + teacher + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>Ausgebucht</div></div></div>" + coursediv.innerHTML);
        }
    } else {
        coursediv.innerHTML = ("<div class='dashboard-course background-color-grey padding-medium'><div class='w-layout-grid dashboard-course-item-grid'><div class='text-size-small text-weight-medium text-color-darkgrey'>" + id + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + newtype + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + start + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + end + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + time + " Uhr</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + places + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + price + "€</div><div class='text-size-small text-weight-medium text-color-darkgrey'>" + teacher + "</div><div class='text-size-small text-weight-medium text-color-darkgrey'>Deaktiviert</div></div></div>" + coursediv.innerHTML);
    }
}

async function getCourseCount() {
    const coll = collection(db, "courses");
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
}

document.addEventListener("DOMContentLoaded", loadCourseList());



// KURS HINZUFÜGEN

const form = document.querySelector("#course-form");
const createstatus = document.querySelector("#create-status");
createstatus.innerHTML = "";

async function setFormData(type, start, end, time, places, price, teacher, archived) {
    let count = await getCourseCount() + 1;
    let courseID = type.toString() + count.toString().padStart(5, '0');

    await setDoc(doc(db, "courses", courseID.toString()), {
        type: type,
        start: start,
        end: end,
        time: time,
        places: parseInt(places),
        price: parseInt(price),
        teacher: teacher,
        archived: archived
    });
}

function submitForm() {
    let archivedBool = (form.elements['archived'].value === "true");
    setFormData(
        form.elements['type'].value,
        form.elements['start'].value,
        form.elements['end'].value,
        form.elements['time'].value,
        form.elements['places'].value,
        form.elements['price'].value,
        form.elements['teacher'].value,
        archivedBool
    );
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitForm();
    createstatus.innerHTML = "Kurs wurde hinzugefügt";
});



// KURS BEARBEITEN

const form2 = document.querySelector("#course-edit-form");
const selectedcourse = document.querySelector("#course-edit");

const editstatusclose = document.querySelector("#edit-status-close");
const editstatus = document.querySelector("#edit-status");
editstatus.innerHTML = "";

function closeEditStatus() {
    editstatus.innerHTML = "";
    editstatusclose.style.display = "none";
}

function openEditStatus() {
    editstatus.innerHTML = "Kurs wurde bearbeitet";
    editstatusclose.style.display = "block";
}

editstatusclose.addEventListener("click", closeEditStatus);

async function loadCourses() {
    const querySnapshot = await getDocs(collection(db, "courses"));
    return querySnapshot.docs;
}

function createSelectOptions(courses) {
    const options = [];
    for (const course of courses) {
        options.push({
            label: course.id,
            value: course.id,
        });
    }
    return options;
}

async function loadSelectField() {
    const courses = await loadCourses();
    const options = createSelectOptions(courses);

    for (const option of options) {
        const newOption = document.createElement("option");
        newOption.value = option.value;
        newOption.textContent = option.label;
        selectedcourse.appendChild(newOption);
    }
}

document.addEventListener("DOMContentLoaded", loadSelectField());

async function onSelectChange() {
    if (selectedcourse.value != "") {
        const selectedCourseID = selectedcourse.value.toString();

        let q = query(collection(db, "courses"), where("__name__", "==", selectedCourseID));
        let querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            document.getElementById("edit-type").value = doc.data().type;
            document.getElementById("edit-start").value = doc.data().start;
            document.getElementById("edit-end").value = doc.data().end;
            document.getElementById("edit-time").value = doc.data().time;
            document.getElementById("edit-places").value = doc.data().places;
            document.getElementById("edit-price").value = doc.data().price;
            document.getElementById("edit-teacher").value = doc.data().teacher;
            document.getElementById("edit-archived").value = doc.data().archived;
        });
    }
}

selectedcourse.addEventListener("change", onSelectChange);

async function setFormData2(type, start, end, time, places, price, teacher, archived) {
    const selectedCourseID = selectedcourse.value.toString();

    await setDoc(doc(db, "courses", selectedCourseID), {
        type: type,
        start: start,
        end: end,
        time: time,
        places: parseInt(places),
        price: parseInt(price),
        teacher: teacher,
        archived: archived
    });
}

function submitForm2() {
    let archivedBool = (form2.elements['edit-archived'].value === "true");
    setFormData2(
        form2.elements['edit-type'].value,
        form2.elements['edit-start'].value,
        form2.elements['edit-end'].value,
        form2.elements['edit-time'].value,
        form2.elements['edit-places'].value,
        form2.elements['edit-price'].value,
        form2.elements['edit-teacher'].value,
        archivedBool
    );
}

form2.addEventListener('submit', (e) => {
    e.preventDefault();
    submitForm2();
    openEditStatus();
});