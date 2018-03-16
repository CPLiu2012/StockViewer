namespace stockrecordformater
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.txt_Input = new System.Windows.Forms.TextBox();
            this.btn_AddToList = new System.Windows.Forms.Button();
            this.btn_ToXML = new System.Windows.Forms.Button();
            this.btn_OpenFile = new System.Windows.Forms.Button();
            this.txt_LineCount_Text = new System.Windows.Forms.TextBox();
            this.txt_LineCount_Deal = new System.Windows.Forms.TextBox();
            this.list_Record = new System.Windows.Forms.ListView();
            this.rtxt_XMLString = new System.Windows.Forms.RichTextBox();
            this.btn_AllDeal = new System.Windows.Forms.Button();
            this.label1 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.txt_LineCount_Usable = new System.Windows.Forms.TextBox();
            this.txt_Deferent = new System.Windows.Forms.TextBox();
            this.btn_BuySell = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // txt_Input
            // 
            this.txt_Input.Location = new System.Drawing.Point(16, 14);
            this.txt_Input.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.txt_Input.Multiline = true;
            this.txt_Input.Name = "txt_Input";
            this.txt_Input.ScrollBars = System.Windows.Forms.ScrollBars.Both;
            this.txt_Input.Size = new System.Drawing.Size(561, 657);
            this.txt_Input.TabIndex = 0;
            this.txt_Input.WordWrap = false;
            // 
            // btn_AddToList
            // 
            this.btn_AddToList.Location = new System.Drawing.Point(585, 15);
            this.btn_AddToList.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.btn_AddToList.Name = "btn_AddToList";
            this.btn_AddToList.Size = new System.Drawing.Size(160, 47);
            this.btn_AddToList.TabIndex = 3;
            this.btn_AddToList.Text = "添加到列表";
            this.btn_AddToList.UseVisualStyleBackColor = true;
            this.btn_AddToList.Click += new System.EventHandler(this.btn_AddToList_Click);
            // 
            // btn_ToXML
            // 
            this.btn_ToXML.Location = new System.Drawing.Point(585, 77);
            this.btn_ToXML.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.btn_ToXML.Name = "btn_ToXML";
            this.btn_ToXML.Size = new System.Drawing.Size(160, 47);
            this.btn_ToXML.TabIndex = 4;
            this.btn_ToXML.Text = "转为XML";
            this.btn_ToXML.UseVisualStyleBackColor = true;
            this.btn_ToXML.Click += new System.EventHandler(this.btn_ToXML_Click);
            // 
            // btn_OpenFile
            // 
            this.btn_OpenFile.Location = new System.Drawing.Point(16, 678);
            this.btn_OpenFile.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.btn_OpenFile.Name = "btn_OpenFile";
            this.btn_OpenFile.Size = new System.Drawing.Size(100, 27);
            this.btn_OpenFile.TabIndex = 6;
            this.btn_OpenFile.Text = "打开文件";
            this.btn_OpenFile.UseVisualStyleBackColor = true;
            this.btn_OpenFile.Click += new System.EventHandler(this.btn_OpenFile_Click);
            // 
            // txt_LineCount_Text
            // 
            this.txt_LineCount_Text.Enabled = false;
            this.txt_LineCount_Text.Font = new System.Drawing.Font("Microsoft Sans Serif", 9.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.txt_LineCount_Text.Location = new System.Drawing.Point(585, 149);
            this.txt_LineCount_Text.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.txt_LineCount_Text.Name = "txt_LineCount_Text";
            this.txt_LineCount_Text.Size = new System.Drawing.Size(159, 26);
            this.txt_LineCount_Text.TabIndex = 7;
            // 
            // txt_LineCount_Deal
            // 
            this.txt_LineCount_Deal.Enabled = false;
            this.txt_LineCount_Deal.Font = new System.Drawing.Font("Microsoft Sans Serif", 9.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.txt_LineCount_Deal.Location = new System.Drawing.Point(585, 196);
            this.txt_LineCount_Deal.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.txt_LineCount_Deal.Name = "txt_LineCount_Deal";
            this.txt_LineCount_Deal.Size = new System.Drawing.Size(159, 26);
            this.txt_LineCount_Deal.TabIndex = 8;
            // 
            // list_Record
            // 
            this.list_Record.HeaderStyle = System.Windows.Forms.ColumnHeaderStyle.Nonclickable;
            this.list_Record.Location = new System.Drawing.Point(755, 15);
            this.list_Record.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.list_Record.Name = "list_Record";
            this.list_Record.Size = new System.Drawing.Size(643, 689);
            this.list_Record.TabIndex = 9;
            this.list_Record.UseCompatibleStateImageBehavior = false;
            this.list_Record.View = System.Windows.Forms.View.Details;
            // 
            // rtxt_XMLString
            // 
            this.rtxt_XMLString.Location = new System.Drawing.Point(755, 15);
            this.rtxt_XMLString.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.rtxt_XMLString.Name = "rtxt_XMLString";
            this.rtxt_XMLString.Size = new System.Drawing.Size(643, 689);
            this.rtxt_XMLString.TabIndex = 10;
            this.rtxt_XMLString.Text = "";
            // 
            // btn_AllDeal
            // 
            this.btn_AllDeal.Location = new System.Drawing.Point(124, 678);
            this.btn_AllDeal.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.btn_AllDeal.Name = "btn_AllDeal";
            this.btn_AllDeal.Size = new System.Drawing.Size(100, 27);
            this.btn_AllDeal.TabIndex = 11;
            this.btn_AllDeal.Text = "所有交易";
            this.btn_AllDeal.UseVisualStyleBackColor = true;
            this.btn_AllDeal.Click += new System.EventHandler(this.btn_AllDeal_Click);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(585, 131);
            this.label1.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(82, 15);
            this.label1.TabIndex = 12;
            this.label1.Text = "文本总行数";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(585, 178);
            this.label2.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(112, 15);
            this.label2.TabIndex = 13;
            this.label2.Text = "交易记录总条数";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(585, 225);
            this.label3.Margin = new System.Windows.Forms.Padding(4, 0, 4, 0);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(112, 15);
            this.label3.TabIndex = 15;
            this.label3.Text = "有效记录总条数";
            // 
            // txt_LineCount_Usable
            // 
            this.txt_LineCount_Usable.Enabled = false;
            this.txt_LineCount_Usable.Font = new System.Drawing.Font("Microsoft Sans Serif", 9.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.txt_LineCount_Usable.Location = new System.Drawing.Point(585, 244);
            this.txt_LineCount_Usable.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.txt_LineCount_Usable.Name = "txt_LineCount_Usable";
            this.txt_LineCount_Usable.Size = new System.Drawing.Size(159, 26);
            this.txt_LineCount_Usable.TabIndex = 14;
            // 
            // txt_Deferent
            // 
            this.txt_Deferent.Location = new System.Drawing.Point(755, 15);
            this.txt_Deferent.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.txt_Deferent.Multiline = true;
            this.txt_Deferent.Name = "txt_Deferent";
            this.txt_Deferent.ScrollBars = System.Windows.Forms.ScrollBars.Both;
            this.txt_Deferent.Size = new System.Drawing.Size(643, 689);
            this.txt_Deferent.TabIndex = 16;
            // 
            // btn_BuySell
            // 
            this.btn_BuySell.Location = new System.Drawing.Point(232, 678);
            this.btn_BuySell.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.btn_BuySell.Name = "btn_BuySell";
            this.btn_BuySell.Size = new System.Drawing.Size(100, 27);
            this.btn_BuySell.TabIndex = 17;
            this.btn_BuySell.Text = "买入卖出";
            this.btn_BuySell.UseVisualStyleBackColor = true;
            this.btn_BuySell.Click += new System.EventHandler(this.btn_BuySell_Click);
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1415, 710);
            this.Controls.Add(this.btn_BuySell);
            this.Controls.Add(this.txt_Deferent);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.txt_LineCount_Usable);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.btn_AllDeal);
            this.Controls.Add(this.rtxt_XMLString);
            this.Controls.Add(this.list_Record);
            this.Controls.Add(this.txt_LineCount_Deal);
            this.Controls.Add(this.txt_LineCount_Text);
            this.Controls.Add(this.btn_OpenFile);
            this.Controls.Add(this.btn_ToXML);
            this.Controls.Add(this.btn_AddToList);
            this.Controls.Add(this.txt_Input);
            this.Margin = new System.Windows.Forms.Padding(4, 3, 4, 3);
            this.Name = "Form1";
            this.Text = "Form1";
            this.Load += new System.EventHandler(this.Form1_Load);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox txt_Input;
        private System.Windows.Forms.Button btn_AddToList;
        private System.Windows.Forms.Button btn_ToXML;
        private System.Windows.Forms.Button btn_OpenFile;
        private System.Windows.Forms.TextBox txt_LineCount_Text;
        private System.Windows.Forms.TextBox txt_LineCount_Deal;
        private System.Windows.Forms.ListView list_Record;
        private System.Windows.Forms.RichTextBox rtxt_XMLString;
        private System.Windows.Forms.Button btn_AllDeal;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.TextBox txt_LineCount_Usable;
        private System.Windows.Forms.TextBox txt_Deferent;
        private System.Windows.Forms.Button btn_BuySell;
    }
}

