import { Request, Response } from "express";

class BaseController {
  model: any;

  constructor(model: any) {
    this.model = model;
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const hasQuery = Object.keys(req.query || {}).length > 0;
      const data = hasQuery ? await this.model.find(req.query) : await this.model.find();
      res.json(data);
      return;
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving data");
      return;
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    try {
      const data = await this.model.findById(id);
      if (!data) {
        res.status(404).send("Not found");
        return;
      }
      res.json(data);
      return;
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving by ID");
      return;
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.model.create(req.body);
      res.status(201).json(data);
      return;
    } catch (err) {
      console.error(err);
      res.status(500).send("Error creating");
      return;
    }
  }

  async del(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    try {
      const deletedData = await this.model.findByIdAndDelete(id);
      res.status(200).json(deletedData);
      return;
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting");
      return;
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    try {
      const data = await this.model.findByIdAndUpdate(id, req.body, { new: true });
      res.json(data);
      return;
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating");
      return;
    }
  }
}

export default BaseController;
