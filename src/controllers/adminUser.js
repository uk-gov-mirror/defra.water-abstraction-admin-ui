const IDM = require('../lib/connectors/idm');
const CRM = require('../lib/connectors/crm');
const Helpers = require('../lib/helpers');
const View = require('../lib/view')

function createAdminUsersUI(request, reply) {
  //view the water index page
  var viewContext = View.contextDefaults(request)
  viewContext.pageTitle = 'GOV.UK - Admin'
  reply.view('water/admin/createAdminUsers', viewContext)
}

async function create(request, reply) {

      const result={idm:{created:0,existing:0},crm:{created:0,existing:0}}
      for (var e in request.payload.user_name){
        var user_name=request.payload.user_name[e]
      console.log(request.payload)
      var data = {};

      try{
      var idmUser = await IDM.usersClient.findMany({user_name:user_name},{},{})
      console.log(idmUser)

      if (idmUser.data.length==0){
        //create user
        const createIdmUser={
        user_name:user_name,
        user_data:{"usertype": "internal", "firstname": ""},
        admin:0, password:Helpers.createGUID(), reset_required:1, reset_guid: Helpers.createGUID()
        }
        console.log("createIdmUser")
        console.log(createIdmUser)
        try{
          var newidmUser = await IDM.usersClient.create(createIdmUser)
          console.log(newidmUser)
//          return reply(newidmUser)
        }catch(e){
          console.log(e)
//          return reply(e)
        }
        result.idm.created++
      } else {
        result.idm.existing++
        console.log('idm entity exists')
      }
    }catch(e){
      console.log(e)
    }

      //create email in idm if not exists
      try{
      var crmUser = await CRM.entities.findMany({entity_nm:user_name},{},{})


      if (crmUser.data.length==0){
        //create user
        const createCrmUser={
        entity_nm:user_name,
        entity_type:"individual",
        entity_definition:"{}",
        }
        console.log("createCrmUser")
        console.log(createCrmUser)
        try{
          var newCrmUser = await CRM.entities.create(createCrmUser)
          console.log(newCrmUser)

          var crmUser = await CRM.entities.findMany({entity_nm:user_name},{},{})
          var crmRegime = await CRM.entities.findMany({entity_nm:'water-abstraction'},{},{})

          var roleData = {};
          data.entity_id = crmUser.data[0].entity_id
          data.role = 'admin';
          data.regime_entity_id = crmRegime.data[0].entity_id;
          data.is_primary = 0
          data.company_entity_id=''

          try{
            var createrole = await CRM.addRole(data)
            console.log('created role')
          } catch(e){
            console.log(e)
          }


        }catch(e){
          console.log(e)
        }
        result.crm.created++
      } else {
        result.crm.existing++
        console.log('crm entity exists')
      }





    }catch(e){
      console.log(e)
    }
  }

      return reply(result)
}

module.exports={
create,
createAdminUsersUI

}
