/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
import express, { json } from 'express';
import { connect, Schema, model } from 'mongoose';
import { resolve } from 'path';
import cors from 'cors';


const app = express()
require('dotenv').config()


app.use(cors({
    origin: 'https://akbarsauto.com', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}));

const port = process.env.PORT || 3000;
const {DB_URI} = process.env;

connect(DB_URI)
  .then(() => console.log('Connected!'))
  .catch((error) => console.error(error))


const AutosSchema = new Schema({
    Title: {type: String},
    Mileage: {type: Number},
    Engine: {type: String},
    Exterior_color: {type: String},
    Interior_color: {type: String},
    Vin: {type: String},
    Description: {type: String},
    Price: {type: Number},
    Image: {type: String}
})

const Autos = model('Autos', AutosSchema)

app.use(json())

app.use((req, res, next) => {
  console.log(`Received ${req.method} request at ${req.url}`);
  next();
});


app.get('/inventory', async (req, res) => {
    try {
      const allCars = await Autos.find({})
      res.send(allCars)
   }
   catch(error) {
      console.error('Error Retrieving Data :', error)
		  res.status(500).send({error: 'Internal Server Error'})
   }
})


app.post('/post', async(req, res) => {
  try{
    const {Title, Mileage, Engine, Exterior_color, Interior_color, Vin, Description, Price, Image} = req.body
    const foundCar = await Autos.findOne({Vin})

    if(!foundCar){
      const newAutos = new Autos({
        Title,
        Mileage,
        Engine,
        Exterior_color,
        Interior_color,
        Vin,
        Description,
        Price,
        Image
      })
      const savedAutos = await newAutos.save();
      console.log('Car successfully saved to the database:', savedAutos); // Add this line
      res.send({message: "Succesfully Added Car", car: newAutos})
    }
    else {
      res.send('Car already posted')
    }
  }
  catch(error) {
			console.error('Error Posting Data :', error)
			res.status(500).send({error: 'Internal Server Error'})   
  }
})

app.delete('/delete/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const deletedCar = await Autos.deleteOne({ _id: id });
        console.log("Deleted Car:", deletedCar);
        res.send("Car successfully deleted");
    } catch (error) {
        console.error('Error Deleting Data:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/inventory/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const carData = await Autos.findById(id);
        res.send(carData);
    } catch (error) {
        console.error('Error Retrieving Car Data:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


app.put('/edit/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const updatedCar = await Autos.findByIdAndUpdate(id, req.body, { new: true });
        res.send("Car successfully edited");
    } catch (error) {
        console.error('Error Updating Car:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});



app.listen(port, () => {console.log(`Server is connected on ${port}`)})