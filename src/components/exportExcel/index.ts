import * as XLSX from "xlsx";

export const exportExcel = (data, nameFile) => {
  const stringToArrayBuffer = (s: string) => {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  };

  const workBookToBlob = (workBook: any) => {
    let wopts: any = {
      bookType: "xlsx", // file type
      bookSST: false,
      type: "binary"
    };
    let wbout = XLSX.write(workBook, wopts);
    let blob = new Blob([stringToArrayBuffer(wbout)], {
      type: "application/octet-stream"
    });
    return blob;
  };

  // func dowload file excel
  const blobToExcel = (blob: any, saveName: any) => {
    let aLink = document.createElement("a");
    aLink.href = URL.createObjectURL(blob); // create address blob
    aLink.download = saveName;
    let event = new MouseEvent("click");
    aLink.dispatchEvent(event);
  };

  let workBook: any = {
    SheetNames: [],
    Sheets: {}
  };
  const sheet = XLSX.utils.json_to_sheet(data);
  const sheetName = "sheet1";
  workBook.SheetNames.push(sheetName);
  workBook.Sheets[sheetName] = {
    ...sheet,
    "!cols": [{ wch: "50" }]
  };

  const blob = workBookToBlob(workBook);
  blobToExcel(blob, nameFile + ".xlsx");
};
