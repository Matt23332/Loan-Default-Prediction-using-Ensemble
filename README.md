# Loan Default Prediction Model
[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/inoLPW_E)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=20099759&assignment_repo_type=AssignmentRepo)

## Introduction
The model has been created to predict the likelihood of a borrower to default on their loan. It employs **Machine Learning algorithms** like **Logistic Regression, Random Forest Classifier and XGBoost** to give accurate and efficient predictions. The model is then utilised within a web application where anyone can create an account and can submit their details through a form. The form sent is sent to the model and in turn the user will get a response of the likelihood.

## Prerequisites
The technologies used for the development of this project include:
- Visual Studio Code
- Google Collab
- Python
- Node.js
- Kaggle (for the dataset)
- Firestore
The dataset(s) utilised for the training and evaluation of the model can be obtained from here: [Kaggle](https://www.kaggle.com/search?q=loan+default+prediction).

## Project Environment
### Visual Studio Code Environment
Visual Studio Code was the IDE utilised to develop the web application using **Angular**. To set up the Angular environment within VS Code, the following steps can be followed:
1. Firstly, ensure you have downloaded [Node.js](https://nodejs.org/en/download) - v20.19 or newer.
2. Open a terminal (if using VS Code, open an intergrated terminal) and run the command `npm install -g @angular/cli`.
3. Within the same terminal, run the CLI command `ng new <project-name>` with the desired project name. Thereafter, configurations options will be displayed from which you select based on your preferences. After selecting the desired configuration options, it will install all the necessary packages.
4. To run the new project locally, switch to the new Angular project within the terminal using the command `cd <project-name>`.
5. All dependencies should be installed and therefore you can start the project by running the command `npm start`.
> [!TIP]
> In case you get stuck or encounter errors when installing Angular, visit this page: [Angular Installation](https://angular.dev/installation)
### Google Collab Environment
Google Collab was used to develop the loan prediction prediction model using Python. The following Python libraries were instrumental in the development of the model:
- Pandas
- Numpy
- Scikit-learn
- Seaborn
- XGBoost
- Imblearn
- Matplotlib
To install any one of the libraries, mentioned above, on Collab simply `import <desired library>`. If you are using VS Code or any other IDE, use the command `pip install <desired library>`.
