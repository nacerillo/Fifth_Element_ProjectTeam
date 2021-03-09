"use strict";
require("dotenv").config();
require("ejs");

const express = require("express");
const superagent = require("superagent");
const app = express();

const pg = require("pg");
const methodOverride = require("method-override");

//client.on("error", (error) => console.log(error));

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", renderHomepage);
//app.post("/cities", addCity);
app.post("/cities", getCity);
app.delete("/cities/:id", deleteCity);

function renderHomepage(req, res) {
  // gets top rated cities
  // takes in search for a new city
  // renders homepage
  res.render("pages/index.ejs");
}

function addCity(req, res) {
  // add city to favorites
  // redirect to favorites page
}

function getCity(req, res) {
  const cityname = req.body.city_name.toLowerCase();
  //console.log(req.body);
  const url = `https://api.teleport.org/api/urban_areas/slug:${cityname}/scores`;
  superagent
    .get(url)
    .then((cityResults) => {
      console.log(cityResults.body);
      let newCity = new City(cityResults.body, cityname);
      //res.render()
      console.log(newCity, "Worked");
      res.render("pages/details.ejs", { newCity: newCity });
    })
    .catch((err) => console.log("Something went wrong"));
  //
  //
}

function deleteCity(res, req) {
  //delete city from favorites
  // direct to favorites page
}

function City(cityData, cityName) {
  //this.image = cityData.image;
  this.name = cityName;
  this.description = cityData.summary;
  this.housing = cityData.catagories[0].score_out_of_10;
  this.cost_of_living = cityData.catagories[1].score_out_of_10;
  // this.happyness = this.
  //this.scores = cityData.scores;
  //this.transportdata = transportdata
}

app.listen(3001, () => {
  console.log("hello world!");
});
