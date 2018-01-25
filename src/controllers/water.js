/**
 * HAPI Route handlers for viewing and managing licences
 * @module controllers/licences
 */
const Boom = require('boom');
const BaseJoi = require('joi');


const View = require('./../lib/view')
const CRM = require('./../lib/connectors/crm');
const IDM = require('./../lib/connectors/idm');
const Permit = require('./../lib/connectors/permit');
const Water = require('./../lib/connectors/water');


function index(request, reply) {
  //view the water index page
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'
  reply.view('water/admin/waterIndex', viewContext)
}

async function scheduler(request,reply){
  //view the water index page
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'
  viewContext.scheduler=await Water.getSchedules()
  console.log('got')
  console.log(viewContext.scheduler)
  reply.view('water/admin/waterScheduler', viewContext)
}

async function schedulerAdd(request,reply){
  //view the water index page
  await Water.addSchedule(request.payload)
  reply.redirect('/admin/water/scheduler')
}
module.exports={
index,
scheduler,
schedulerAdd

}
