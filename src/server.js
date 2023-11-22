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

const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }


  next();
};

app.use(corsMiddleware);
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

app.get('/inventory', async (req, res) => {
    try {
      const allCars = await Autos.find({})
      res.status(200).send({ message: 'Found inventory' });
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
      res.status(201).send({ message: 'Car successfully posted' });
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
        res.status(200).send({ message: 'Vehicle Deleted' });
    } catch (error) {
        console.error('Error Deleting Data:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/inventory/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const carData = await Autos.findById(id);
        res.status(200).send({ message: 'Heres your vehicle' });
    } catch (error) {
        console.error('Error Retrieving Car Data:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


app.put('/edit/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const updatedCar = await Autos.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).send({ message: 'Car successfully updated' });
    } catch (error) {
        console.error('Error Updating Car:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});



app.listen(port, () => {console.log(`Server is connected on ${port}`)})