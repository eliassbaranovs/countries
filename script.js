"use strict";

const btn = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");

/////////////////////////////////////////

//Render function
const renderCountry = function (data, className = "") {
  const html = `
  <article class="country ${className}">
          <img class="country__img" src="${Object.values(data.flags)[0]}" />
          <div class="country__data">
            <h3 class="country__name">${Object.values(data.name)[0]}</h3>
            <h4 class="country__region"${data.region}</h4>
            <p class="country__row"><span>👫</span>${(
              +data.population / 1000000
            ).toFixed(1)}M</p>
            <p class="country__row"><span>🗣️</span>${Object.values(
              data.languages
            )}</p>
            <p class="country__row"><span>💰</span>${Object.keys(
              data.currencies
            )}</p>
          </div>
        </article>`;
  countriesContainer.insertAdjacentHTML("beforeend", html);
  // countriesContainer.style.opacity = 1; Moved to .finally()
};

//Render error message
const renderError = function (msg) {
  countriesContainer.insertAdjacentText("beforeend", msg);
  // countriesContainer.style.opacity = 1; Moved to .finally()
};

//Get contry data
const getData = function (country) {
  //Country 1
  getJSON(
    `https://restcountries.com/v3.1/name/${country}`,
    `Country not found!`
  )
    .then((data) => {
      renderCountry(data[0]);
      const neighbour = data[0].borders?.[0];
      if (!neighbour) throw new Error("No neighbour found!");
      //Country 2
      return getJSON(
        `https://restcountries.com/v3.1/alpha/${neighbour}`,
        `Country not found!`
      );
    })
    .then((data) => {
      renderCountry(data[0], "neighbour");
    })
    .catch((err) => {
      renderError(`Something went wrong: ${err.message}`);
    })
    .finally(() => {
      countriesContainer.style.opacity = 1;
    });
};

//Helper function so fetch API is not repeated
const getJSON = function (url, errorMsg = `Something went wrong!`) {
  return fetch(url).then((response) => {
    //Handling error when country not found
    if (!response.ok) {
      throw new Error(`${errorMsg} (${response.status})`);
    }
    return response.json();
  });
};

//Coding challenge

const whereAmI = function (lat, lng) {
  const url = `https://geocode.xyz/${lat},${lng}?json=1&auth=401671508397917647269x4456`;
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Something went wrong! (${response.status})`);
      }
      return response.json();
    })
    .then((data) => {
      getData(data.country);
    })
    .catch((err) => console.log(err));
};

//Event listener for button with geolocation API
btn.addEventListener("click", function () {
  countriesContainer.innerHTML = "";
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        whereAmI(lat, lng);
      },
      (err) => {
        renderError(
          `Something went wrong: (${err.message}). Please allow location access to use this application!`
        );
        countriesContainer.style.opacity = 1;
      }
    );
  }
});
