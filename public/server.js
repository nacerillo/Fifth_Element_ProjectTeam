"use strict";
require("dotenv").config();
require("ejs");

const express = require("express");
const superagent = require("superagent");
const app = express();
let PORT = process.env.PORT;
const pg = require("pg");
const methodOverride = require("method-override");

client.on("error", (error) => console.log(error));

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", renderHomepage);
app.post("/cities", addCity);
app.get("/cities/:id", getCity);
app.delete("/cities/:id", deleteCity);

function renderHomepage(req, res) {
  // gets top rated cities
  // takes in search for a new city
  // renders homepage
}

function addCity(req, res) {
  // add city to favorites
  // redirect to favorites page
}

function getCity(req, res) {
  //gets results of a searched city.
  // renders details of searched city
}
function deleteCity(res, req) {
  //delete city from favorites
  // direct to favorites page
}
