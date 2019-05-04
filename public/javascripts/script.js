"use strict"
function changeDate() {
    let d = new Date();
    d.setHours(d.getHours()+8); //localize to Beijing time
    document.getElementsByName("sign_in_day")[0].value = d.toISOString().slice(0,10);
    document.getElementsByName("time")[0].value = d.toISOString().slice(11,16);
}

function submit_confirm(){
    let msg = "请核对以下信息，无误后点击确认完成报名";
    msg += "\n姓名：" + document.getElementsByName("name")[0].value;
    msg += "\n性别：" + document.getElementsByName("sex")[0].value;
    msg += "\n报读年级：" + document.getElementsByName("grade")[0].value;
    msg += "\n报读学期：" + document.getElementsByName("year")[0].value +
        "年" + document.getElementsByName("season")[0].value;
    msg += "\n联系人：" + document.getElementsByName("contact")[0].value;
    msg += "\n联系人手机：" + document.getElementsByName("contact_number")[0].value;
    return confirm(msg);
}

$(document).ready(
    function () {
        changeDate();
    }
);