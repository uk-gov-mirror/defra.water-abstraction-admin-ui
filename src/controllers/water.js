/**
 * HAPI Route handlers for viewing and managing licences
 * @module controllers/licences
 */
const View = require('./../lib/view');
const Water = require('./../lib/connectors/water');

async function index (request, reply) {
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  return reply.view('water/admin/waterIndex', viewContext);
};

async function scheduler (request, reply) {
  const viewContext = View.contextDefaults(request);
  viewContext.pageTitle = 'GOV.UK - Admin';
  viewContext.scheduler = await Water.getSchedules();
  return reply.view('water/admin/waterScheduler', viewContext);
}

async function schedulerAdd (request, reply) {
  await Water.addSchedule(request.payload);
  return reply.redirect('/admin/water/scheduler');
}

exports.index = index;
exports.scheduler = scheduler;
exports.schedulerAdd = schedulerAdd;
