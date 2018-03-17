using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;
using System.Xml.Linq;
using System.Net;

namespace stockrecordformater
{
    public partial class Form1 : Form
    {
        string directoryPath = "D:\\Work\\StockViewer\\MyStock\\data";
        //string directoryPath = "H:\\Work\\StockViewer\\MyStock\\data";
        List<string> filterList = new List<string> { "指定交易登记指定", "新股申购", "申购返款", "新股入帐", "托管转出", "托管转入", "IPO市值配售", "配售认购", "余额更新" };
        List<recordObject> recordList = new List<recordObject>();
        Dictionary<string, List<recordObject>> stockDict;
        Dictionary<string, string> stockCodeDict;

        public Form1()
        {
            InitializeComponent();
        }
        private void btn_OpenFile_Click(object sender, EventArgs e)
        {
            string[] recordFilesNames = Directory.GetFiles(directoryPath);
            StringBuilder sbAll = new StringBuilder();
            int lineCount = 0;
            for (int i = 0; i < recordFilesNames.Length; i++)
            {
                if (recordFilesNames[i].IndexOf("record") < 0)
                {
                    continue;
                }

                StreamReader sr = new StreamReader(recordFilesNames[i], Encoding.UTF8);
                string tmpLine;
                while ((tmpLine = sr.ReadLine()) != null)
                {
                    lineCount++;
                    sbAll.AppendLine(tmpLine);
                }

                sr.Close();
            }

            this.txt_Input.Text = sbAll.ToString();
            this.txt_LineCount_Text.Text = lineCount.ToString();
        }
        private void btn_AllDeal_Click(object sender, EventArgs e)
        {
            string allText = this.txt_Input.Text;
            string[] inputStrArray = this.txt_Input.Text.Split(new char[2] { '\r', '\n' });
            string tmpString = "";
            string[] tmpArr;
            int lineCount = 0;
            StringBuilder tmpSB = new StringBuilder();
            StringBuilder deferentSB = new StringBuilder();
            for (int i = 0; i < inputStrArray.Length; i++)
            {
                tmpString = inputStrArray[i];
                if (this.checkIsDeal(tmpString))
                {
                    tmpString = this.replaceSpaceChar(tmpString);
                    tmpArr = tmpString.Split(' ');
                    if (tmpArr.Length != 10)
                    {
                        deferentSB.AppendLine(tmpString);
                    }
                    else
                    {
                        lineCount++;
                        tmpSB.AppendLine(tmpString);
                    }
                }
            }

            this.txt_Input.Text = tmpSB.ToString();
            this.txt_LineCount_Deal.Text = lineCount.ToString();
            this.rtxt_XMLString.Hide();
            this.list_Record.Hide();
            this.txt_Deferent.Show();
            this.txt_Deferent.Text = deferentSB.ToString();
            if (File.Exists(this.directoryPath + "\\alldeal.txt"))
            {
                File.Delete(this.directoryPath + "\\alldeal.txt");
            }
            File.WriteAllText(this.directoryPath + "\\alldeal.txt", tmpSB.ToString(), Encoding.UTF8);
        }
        private bool checkIsDeal(string sourceStr)
        {
            if (sourceStr.IndexOf("2015") == 0 || sourceStr.IndexOf("2016") == 0 || sourceStr.IndexOf("2017") == 0 || sourceStr.IndexOf("2018") == 0)
            {
                if (sourceStr.IndexOf("A808998161") > 0 || sourceStr.IndexOf("0166956170") > 0)
                {
                    if (sourceStr.IndexOf("000501") > 0)
                    {
                        if (sourceStr.IndexOf("配号") < 0 && sourceStr.IndexOf("申购款") < 0)
                        {
                            return true;
                        }
                    }
                }
            }

            return false;
        }
        private string replaceSpaceChar(string sourceStr)
        {
            while (sourceStr.IndexOf("  ") >= 0)
            {
                sourceStr = sourceStr.Replace("  ", " ").Replace("盐 田 港", "盐田港");
            }

            sourceStr = sourceStr.Replace("盐 田 港", "盐田港");
            sourceStr = sourceStr.Replace("申购中签", "证券买入");
            sourceStr = sourceStr.Replace("配售中签", "证券买入");
            return sourceStr;
        }
        private void btn_BuySell_Click(object sender, EventArgs e)
        {
            string allText = this.txt_Input.Text;
            string[] inputStrArray = this.txt_Input.Text.Split(new char[2] { '\r', '\n' });
            string tmpString = "";
            int lineCount = 0;
            StringBuilder tmpSB = new StringBuilder();
            StringBuilder deferentSB = new StringBuilder();
            for (int i = 0; i < inputStrArray.Length; i++)
            {
                tmpString = inputStrArray[i];
                if (tmpString.IndexOf("证券买入") > 0 || tmpString.IndexOf("证券卖出") > 0)
                {
                    lineCount++;
                    tmpSB.AppendLine(tmpString);
                }
                else if (string.Empty != tmpString)
                {
                    bool flag = true;
                    for (int j = 0; j < filterList.Count; j++)
                    {
                        if (tmpString.IndexOf(filterList[j]) > 0)
                        {
                            flag = false;
                            break;
                        }
                    }

                    if (flag)
                    {
                        lineCount++;
                        tmpString = tmpString.Replace("红利差异税扣税", "红利扣税").Replace("红利差异税补扣", "红利扣税");
                        deferentSB.AppendLine(tmpString);
                        tmpSB.AppendLine(tmpString);
                    }
                }
            }

            this.txt_Input.Text = tmpSB.ToString();
            this.txt_LineCount_Usable.Text = lineCount.ToString();
            this.rtxt_XMLString.Hide();
            this.list_Record.Hide();
            this.txt_Deferent.Show();
            this.txt_Deferent.Text = deferentSB.ToString();
            if (File.Exists(this.directoryPath + "\\allbuysell.txt"))
            {
                File.Delete(this.directoryPath + "\\allbuysell.txt");
            }
            File.WriteAllText(this.directoryPath + "\\allbuysell.txt", tmpSB.ToString());
            if (File.Exists(this.directoryPath + "\\allother.txt"))
            {
                File.Delete(this.directoryPath + "\\allother.txt");
            }

            File.WriteAllText(this.directoryPath + "\\allother.txt", deferentSB.ToString(), Encoding.UTF8);
        }
        private void btn_AddToList_Click(object sender, EventArgs e)
        {
            this.rtxt_XMLString.Hide();
            this.txt_Deferent.Hide();
            this.list_Record.Show();
            this.list_Record.BeginUpdate();
            string[] inputStrArray = (this.txt_Input.Text).Split(new char[2] { '\r', '\n' });
            for (int i = 0; i < inputStrArray.Length; i++)
            {
                if (inputStrArray[i].Trim() == "")
                {
                    continue;
                }

                recordObject recObj = new recordObject(inputStrArray[i].Split(' '));
                this.recordList.Add(recObj);
                this.list_Record.Items.Add(recObj.toListViewItem(this.recordList.Count));
            }

            this.list_Record.EndUpdate();
        }
        private void btn_ToXML_Click(object sender, EventArgs e)
        {
            this.rtxt_XMLString.Show();
            this.list_Record.Hide();
            this.getStockDict();
            XDocument xDoc = this.getStockXMLDoc();
            this.rtxt_XMLString.Text = xDoc.Root.ToString();
            if (File.Exists(this.directoryPath + "\\dataxml.txt"))
            {
                File.Delete(this.directoryPath + "\\dataxml.txt");
            }
            File.WriteAllText(this.directoryPath + "\\dataxml.txt", this.rtxt_XMLString.Text, Encoding.UTF8);

        }
        private void Form1_Load(object sender, EventArgs e)
        {
            this.list_Record.Columns.Add("", 40, HorizontalAlignment.Center);
            this.list_Record.Columns.Add("名称", 60, HorizontalAlignment.Center);
            this.list_Record.Columns.Add("代码", 50, HorizontalAlignment.Center);
            this.list_Record.Columns.Add("日期", 70, HorizontalAlignment.Center);
            this.list_Record.Columns.Add("交易", 40, HorizontalAlignment.Center);
            this.list_Record.Columns.Add("数量", 40, HorizontalAlignment.Right);
            this.list_Record.Columns.Add("均价", 50, HorizontalAlignment.Right);
            this.list_Record.Columns.Add("手续费", 50, HorizontalAlignment.Right);
            this.list_Record.Columns.Add("税费", 50, HorizontalAlignment.Right);
            this.list_Record.Columns.Add("其他", 50, HorizontalAlignment.Right);
            this.rtxt_XMLString.Hide();
        }
        private class recordObject : Object
        {
            private DateTime _date;
            private int _type;
            private string _name;
            private string _code;
            private int _amount;
            private double _price;
            private double _fee;
            private double _tax;
            private double _dividend;
            private recordObject()
            {

            }
            public DateTime Date
            {
                get
                {
                    return this._date;
                }
            }
            public int Type
            {
                get
                {
                    return this._type;
                }
            }
            public string Name
            {
                get
                {
                    return this._name;
                }
            }
            public string Code
            {
                get
                {
                    return this._code;
                }

                set
                {
                    this._code = value;
                }
            }
            public int Amount
            {
                get
                {
                    return this._amount;
                }
            }
            public double Price
            {
                get
                {
                    return this._price;
                }
            }
            public double Fee
            {
                get
                {
                    return this._fee;
                }
            }
            public double Tax
            {
                get
                {
                    return this._tax;
                }
            }
            public double Dividend
            {
                get
                {
                    return this._dividend;
                }
            }
            public recordObject(string[] sourceStringArr)
            {
                string tmpStr = sourceStringArr[0];
                this._date = Convert.ToDateTime(tmpStr.Substring(0, 4) + "-" + tmpStr.Substring(4, 2) + "-" + tmpStr.Substring(6, 2));
                tmpStr = sourceStringArr[3];
                this._dividend = 0;
                if (tmpStr.IndexOf("证券买入") == 0)
                {
                    this._type = 1;
                }
                else if (tmpStr.IndexOf("证券卖出") == 0)
                {
                    this._type = -1;
                }
                else if (tmpStr.IndexOf("股息入帐") == 0)
                {
                    this._type = 2;
                    this._dividend = Convert.ToDouble(sourceStringArr[8]);
                }
                else if (tmpStr.IndexOf("红利扣税") == 0)
                {
                    this._type = -2;
                    this._dividend = Convert.ToDouble(sourceStringArr[8]);
                }
                else if (tmpStr.IndexOf("红股入帐") == 0)
                {
                    this._type = 3;
                }
                else
                {
                    this._type = 0;
                }

                this._name = tmpStr.Substring(4);
                switch (this._name)
                {
                    case "京东方Ａ":
                        this._name = "京东方a";
                        break;
                    case "武钢股份":
                        this._name = "宝钢股份";
                        break;
                    case "中核申购":
                        this._name = "中国核电";
                        break;
                    case "歌尔声学":
                        this._name = "歌尔股份";
                        break;
                    case "XD中信证":
                        this._name = "中信证券";
                        break;
                    case "国投新集":
                    case "*ST新集":
                        this._name = "新集能源";
                        break;
                    case "鹿港科技":
                    case "DR鹿港科":
                        this._name = "鹿港文化";
                        break;
                    case "江南红箭":
                        this._name = "中兵红箭";
                        break;
                    case "攀钢钒钛":
                        this._name = "*ST钒钛";
                        break;
                    case "长城信息":
                    case "长城电脑":
                        this._name = "中国长城";
                        break;
                }

                this._code = "";
                this._amount = Convert.ToInt32(Convert.ToDouble(sourceStringArr[4]));
                this._price = Convert.ToDouble(sourceStringArr[5]);
                this._fee = Convert.ToDouble(sourceStringArr[6]);
                this._tax = Convert.ToDouble(sourceStringArr[7]);
            }
            public ListViewItem toListViewItem(int index)
            {
                ListViewItem tempItem = new ListViewItem();
                tempItem.ImageIndex = index;
                tempItem.Text = index.ToString().PadLeft(4, '0');
                tempItem.SubItems.Add(this._name);
                tempItem.SubItems.Add(this._code.ToString());
                tempItem.SubItems.Add(this._date.ToShortDateString());
                string tmpStr = "";
                switch (this._type)
                {
                    case 1:
                        tmpStr = "买入";
                        break;
                    case -1:
                        tmpStr = "卖出";
                        break;
                    case 2:
                        tmpStr = "股息";
                        break;
                    case -2:
                        tmpStr = "利税";
                        break;
                    case 3:
                        tmpStr = "红股";
                        break;
                }

                tempItem.SubItems.Add(tmpStr);
                tempItem.SubItems.Add(this._amount.ToString());
                tempItem.SubItems.Add(this._price.ToString("f2"));
                tempItem.SubItems.Add(this._fee.ToString("f2"));
                tempItem.SubItems.Add(this._tax.ToString("f2"));
                tempItem.SubItems.Add(this._dividend.ToString("f2"));
                return tempItem;
            }
        }
        private void getStockDict()
        {
            this.stockDict = new Dictionary<string, List<recordObject>>();
            this.stockCodeDict = new Dictionary<string, string>();
            StringBuilder tmpSB = new StringBuilder();
            for (int i = 0; i < this.recordList.Count; i++)
            {
                if (!this.stockDict.ContainsKey(this.recordList[i].Name))
                {
                    this.recordList[i].Code = this.getStockCode(this.recordList[i].Name);
                    if (this.recordList[i].Code.Length != 8)
                    {
                        tmpSB.AppendLine(this.recordList[i].Code);
                    }
                    List<recordObject> newList = new List<recordObject>();
                    newList.Add(this.recordList[i]);
                    this.stockDict.Add(this.recordList[i].Name, newList);
                }
                else
                {
                    this.stockDict[this.recordList[i].Name].Add(this.recordList[i]);
                }
            }

            this.txt_Input.Text = tmpSB.ToString();
        }
        private XDocument getStockXMLDoc()
        {
            XDocument xDoc = new XDocument();
            XElement root = new XElement("root");
            xDoc.Add(root);
            List<recordObject> tmpList;
            string stockCode = "";
            foreach (string key in this.stockDict.Keys)
            {
                stockCode = "";
                XElement recRootEl = new XElement("recs");
                for (int i = 0; i < this.stockDict[key].Count; i++)
                {
                    tmpList = this.stockDict[key];
                    if (tmpList[i].Code != "")
                    {
                        stockCode = tmpList[i].Code;
                    }

                    recRootEl.Add(new XElement("i",
                        new XAttribute("d", tmpList[i].Date.ToShortDateString()),
                        new XAttribute("t", ""),
                        new XAttribute("p", tmpList[i].Price.ToString()),
                        new XAttribute("a", tmpList[i].Amount.ToString()),
                        new XAttribute("f", tmpList[i].Type > 0 ? (tmpList[i].Type == 1 ? "b" : tmpList[i].Type == 2 ? "d" : "r") : (tmpList[i].Type == -1 ? "s" : "t")),
                        new XAttribute("c", tmpList[i].Fee.ToString()),
                        new XAttribute("x", tmpList[i].Tax.ToString()),
                        new XAttribute("e", tmpList[i].Dividend.ToString())
                    ));
                }

                root.Add(new XElement("stock",
                    new XAttribute("id", stockCode),
                    new XAttribute("symbol", ""),
                    recRootEl,
                    new XElement("advise")
                ));
            }

            return xDoc;
        }
        private string getStockCode(string stockName)
        {
            try
            {
                string strURL = " http://suggest3.sinajs.cn/suggest/type=11,12&key=" + stockName.ToLower();
                HttpWebRequest request;
                request = (System.Net.HttpWebRequest)WebRequest.Create(strURL);
                request.Method = "get";
                System.Net.HttpWebResponse response;
                response = (System.Net.HttpWebResponse)request.GetResponse();
                System.IO.StreamReader myreader = new System.IO.StreamReader(response.GetResponseStream(), Encoding.GetEncoding("GBK"));
                string responseText = myreader.ReadToEnd();
                myreader.Close();
                return responseText.Split('=')[1].Split(',')[3];
            }
            catch (Exception ex)
            {
                return stockName;
            }
        }
    }
}