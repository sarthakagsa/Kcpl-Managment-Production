const express = require('express')
const app = express()
const ExcelJs = require('exceljs')

app.get('/',async(req,res)=>{
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet('LR');

    worksheet.addRow({id: 1, name: 'John Doe', dob: new Date(1970,1,1)});

    await workbook.xlsx.writeFile('test.xlsx')
    res.download('test.xlsx')
})

app.listen(3000,()=>{
    console.log('server is connected to the port : '+3000)
})