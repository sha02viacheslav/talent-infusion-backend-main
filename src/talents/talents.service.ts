
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Talent } from "./talents.entity";
import * as Airtable from "airtable";
import { getAirtableConfig } from "src/config";
import { Logger } from '@nestjs/common';

@Injectable()
export class TalentService {
  private readonly base: Airtable.Base;
  constructor(
    @InjectModel("Talent") private talentModel: Model<Talent>,
  ) {
    this.base = new Airtable({ apiKey: getAirtableConfig().apiKey }).base(getAirtableConfig().baseId)
  }
  async search (
      name: string,
      area_of_work: string,
      title: string,
      page = 1,
      limitt = 10
  ) {
    const data = [] 
    await this.base('Resume Database').select({
      maxRecords:10,
      pageSize: 10,
      // pass optional config parameters here
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
        records.forEach(function(record) {
            data.push(record._rawJson)
        });
        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
    })
    return data;
  }

  async queryCount(
    filterByFormula = null,
  ) {
    let result = (await this.base('Resume Database').select({
      filterByFormula: filterByFormula
    }).all()).length;
    return { result };
  }
}