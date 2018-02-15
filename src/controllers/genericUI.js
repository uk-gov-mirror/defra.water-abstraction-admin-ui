const View = require('./../lib/view')
const Endpoints={};
Endpoints.CRM = require('./../lib/connectors/crm');
Endpoints.IDM = require('./../lib/connectors/idm');
Endpoints.Permit = require('./../lib/connectors/permit');
Endpoints.Water = require('./../lib/connectors/water');


const viewConfig={};
viewConfig.Water={}
viewConfig.CRM={}
viewConfig.Water.notifications={
  title:'Scheduled Notifications',
  exclude:[]
}
viewConfig.Water.notify_templates={
  title:'Notify Templates',
  exclude:[]
}

viewConfig.CRM.entities={
  title:'Entities',
  exclude:[],
  perPage:30,
}

async function list(request,reply,endpoint,obj){
  console.log(endpoint,obj)

  const config=viewConfig[endpoint][obj];

  console.log(config)

  var viewContext = View.contextDefaults(request)
  const req={};
  req.Filter={}
  req.Sort={}
  req.Pagination={page: 1, perPage : config.perPage||25}
  if(request.query.page){
    req.Pagination.page=request.query.page
  }
  if(request.query.filter){
    console.log(request.query.filter)
    req.Filter=JSON.parse(request.query.filter)
  }
  console.log('making request to endpoint')
  const {data:baseData, pagination}=await Endpoints[endpoint][obj].findMany(req.Filter,req.Sort,req.Pagination)
  console.log('got response from endpoint')

  viewContext.pageTitle = 'GOV.UK - Admin'
  viewContext.columns=[];
  for (var key in baseData[0]){
    console.log(key)
    if(!config.exclude.includes(key)){
      viewContext.columns.push({name:key});
    }
  }
  console.log(viewContext.columns)
  viewContext.data=[];

  baseData.forEach((r)=>{
    var row=[];
    for (var key in baseData[0]){
      console.log(key)
      if(!config.exclude.includes(key)){
      row.push(r[key])
      }
    }
    viewContext.data.push(row);
  })

  console.log(viewContext.data)

  viewContext.title=config.title;
  if(pagination.page * pagination.perPage < pagination.totalRows){
    qs=[request.url.path.split('?')[0]+"?"]

    for(var p in request.query){
        if(p=='page'){
            qs.push('page='+(parseInt(pagination.page)+1))
        } else {
            qs.push(p+'='+request.query[p])
        }
    }

    pagination.nextPage=qs.join('&')

  }
  if(pagination.page > 1){
    qs=[request.url.path.split('?')[0]+"?"]

    for(var p in request.query){
        if(p=='page'){
            qs.push('page='+(parseInt(pagination.page)-1))
        } else {
            qs.push(p+'='+request.query[p])
        }
    }

    pagination.previousPage=qs.join('&')
  }
  viewContext.pagination=pagination;
  reply.view('water/admin/standardListView', viewContext)
}

module.exports={
list

}
