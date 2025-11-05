import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Firestore, doc, setDoc, collection, addDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap, tap, map } from 'rxjs/operators';

export interface LoanApplication {
  userId: string;
  applicationId: string;

  age: number;
  income: number;
  educationLevel: string;
  employmentStatus: string;
  creditScore: number;
  loanAmount: number;
  loanPurpose: string;
  loanTerm: number;
  interestRate: number;
  debtToIncomeRatio: number;

  prediction?: {
    defaultProbability: number;
    riskLevel: 'low' | 'medium' | 'high';
    model: string;
    confidenceScore: number;
  }
  //metadata
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

@Injectable({
  providedIn: 'root'
})
export class LoanPredictionService {
  private http = inject(HttpClient);
  private firestore = inject(Firestore);

  private apiUrl = '';

  constructor() {
    console.log('LoanPredictionService initialized');
  }

  getPrediction(loanData: Partial<LoanApplication>): Observable<any> {
    console.log('Sending data to model: ', loanData);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const payload = {
      age: loanData.age,
      income: loanData.income,
      educationLevel: loanData.educationLevel,
      employmentStatus: loanData.employmentStatus,
      creditScore: loanData.creditScore,
      loanAmount: loanData.loanAmount,
      loanPurpose: loanData.loanPurpose,
      loanTerm: loanData.loanTerm,
      interestRate: loanData.interestRate,
      debtToIncomeRatio: loanData.debtToIncomeRatio
    };

    return this.http.post(`${this.apiUrl}/predict`, payload, { headers })
      .pipe(
        tap(response => console.log('Received prediction response: ', response)),
        catchError(error => {
          console.error('Error occurred while getting prediction: ', error);
          return throwError(error);
        })
      );
  }

  submitLoanApplication(
    userId: string,
    loanData: Partial<LoanApplication>
  ): Observable<string> {
    console.log('Submitting loan application for user: ', userId);

    return this.getPrediction(loanData).pipe(
      switchMap(predictionResult => {
        const prediction = {
          defaultProbability: predictionResult.defaultProbability,
          riskLevel: predictionResult.riskLevel,
          model: predictionResult.model,
          confidenceScore: predictionResult.confidenceScore
        };

        const status = prediction.defaultProbability < 0.3 ? 'approved' :
          prediction.defaultProbability < 0.7 ? 'pending' : 'rejected';

        const application: LoanApplication = {
          ...loanData as LoanApplication,
          userId,
          prediction,
          status,
          submittedAt: new Date()
        };

        const applicationsRef = collection(this.firestore, 'loanApplications');
        return from(addDoc(applicationsRef, application)).pipe(
          map(docRef => {
            console.log('Application stored with ID: ', docRef.id);
            return docRef.id;
          })
        );
      }),
      tap(applicationId => console.log('Loan application submitted: ', applicationId)),
      catchError(error => {
        console.error('Error submitting loan application: ', error);
        return throwError(() => error);
      })
    );
  }

  getUserApplications(userId: string): Observable<LoanApplication[]> {
    console.log('Fetching applications for user: ', userId);

    const applicationsRef = collection(this.firestore, 'loanApplications');
    const q = query(applicationsRef, where('userId', '==', userId));

    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        const applications: LoanApplication[] = [];
        querySnapshot.forEach(doc => {
          applications.push({
            applicationId: doc.id,
            ...doc.data()
          } as LoanApplication);
        });
        console.log('Found', applications.length, 'applications');
        return applications;
      }),
      catchError(error => {
        console.error('Error fetching applications: ', error);
        return throwError(() => error);
      })
    );
  }

  getApplication(applicationId: string): Observable<LoanApplication | null> {
    const docRef = doc(this.firestore, `loanApplications/${applicationId}`);
    return from(getDocs(query(collection(this.firestore, 'loanApplications')))).pipe(
      map(snapshot => {
        const appDoc = snapshot.docs.find(d => d.id === applicationId);
        if (appDoc) {
          return { applicationId: appDoc.id, ...appDoc.data() } as LoanApplication;
        }
        return null;
      })
    );
  }
}
