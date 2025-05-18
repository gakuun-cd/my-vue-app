import store from "~/store"

function hasPermission(value,el=false){
    if(!Array.isArray(value)){
        throw new Error(`需要配置权限,例如  v-permission="['getStatistics3,GET']"`)
    }
    const hsaAuth=value.findIndex(v=>store.state.ruleNames.includes(v))!=-1
    if(el && !hsaAuth){
        el.parentNode && el.parentNode.removeChild(el)
    }
    return hsaAuth
}
export default{
    install(app){
        app.directive("permission",{
            mounted(el,binding){
                hasPermission(binding.value,el)
            }
        })
    }
}