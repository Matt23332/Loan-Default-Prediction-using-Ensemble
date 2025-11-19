import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Firestore, doc, setDoc, collection, addDoc, getDoc, query, where, getDocs, Timestamp, orderBy, deleteDoc } from '@angular/fire/firestore';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap, tap, map } from 'rxjs/operators';
import { deleteApp } from '@angular/fire/app';

export interface LoanApplication {
  userId: string;
  applicationId: string;
  name: string;
  email: string;

  age: number;
  education: string;
  income: number;
  maritalStatus: string;
  hasDependents: string;
  hasCoSigner: string;
  hasMortgage: string;
  employmentStatus: string;
  employmentType: string;
  homeOwnership: string;
  creditScore: number;
  loanAmount: number;
  loanPurpose: string;
  loanTerm: number;
  interestRate: number;
  monthsEmployed: number;
  numCreditLines: number;

  prediction?: PredictionResult;
  //metadata
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PredictionResult {
  applicationId: string;
  modelPrediction: string;
  riskScore: number;
  confidence: number;
  modelPredictions: {
    defaultRisk: number;
    average: number;
  };
}

export interface SavedApplication extends LoanApplication {
  userId: string;
  prediction: PredictionResult;
  timestamp: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoanPredictionService {
  private http = inject(HttpClient);
  private firestore = inject(Firestore);

  private apiUrl = 'https://12b6b2f57262.ngrok-free.app';

  constructor() {
    console.log('LoanPredictionService initialized');
  }

  predictLoanDefault(loanData: Partial<LoanApplication>): Observable<PredictionResult> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<PredictionResult>(
      `${this.apiUrl}/predict`,
      loanData,
      { headers }
    );
  }

  checkHealth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/health`);
  }

  getPrediction(userId: string, loanData: Partial<LoanApplication>): Observable<{applicationId: string, prediction: PredictionResult}> {
    console.log('Sending data to model: ', loanData);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const payload = {
      name: loanData.name,
      email: loanData.email,
      age: loanData.age,
      income: loanData.income,
      education: loanData.education,
      maritalStatus: loanData.maritalStatus,
      hasDependents: loanData.hasDependents,
      hasCoSigner: loanData.hasCoSigner,
      hasMortgage: loanData.hasMortgage,
      employmentStatus: loanData.employmentStatus,
      creditScore: loanData.creditScore,
      loanAmount: loanData.loanAmount,
      loanPurpose: loanData.loanPurpose,
      loanTerm: loanData.loanTerm,
      interestRate: loanData.interestRate,
      monthsEmployed: loanData.monthsEmployed,
      numCreditLines: loanData.numCreditLines,
      employmentType: loanData.employmentType,
      homeOwnership: loanData.homeOwnership
    };

    console.log('Payload sent to model: ', payload);
    return this.http.post<PredictionResult>(
      `${this.apiUrl}/predict`, payload, { headers }).pipe(
        switchMap((predictionResult) => {
          console.log('Prediction received...');

          const applicationData: SavedApplication = {
            ...payload as LoanApplication,
            userId,
            timestamp: Timestamp.now(),
            prediction: predictionResult
        };
        const applicationsCollection = collection(this.firestore, 'loan-application');
        return from(addDoc(applicationsCollection, applicationData)).pipe(
          switchMap((docRef) => {
            console.log('Application saved with ID: ', docRef.id);

            const updatedPrediction = {
              ...predictionResult,
              applicationId: docRef.id
            };
            return from(Promise.resolve({
              applicationId: docRef.id,
              prediction: updatedPrediction
            }));
          })
        );
    }),
    catchError((error) => {
      console.error('Error submitting the application: ', error);
      return throwError(() => error);
    })
  );
  }

  getApplication(applicationId: string): Observable<SavedApplication | null> {
    const docRef = doc(this.firestore, `loan-application/${applicationId}`);

    return from(getDoc(docRef)).pipe(
      switchMap((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SavedApplication;
          return from(Promise.resolve({
            ...data,
            applicationId: docSnap.id
          }));
        }
        return from(Promise.resolve(null));
      }),
      catchError((error) => {
        console.error('Error fetching application: ', error);
        return throwError(() => error);
      })
    );
  }

  getUserApplications(userId: string): Observable<SavedApplication[]> {
    const applicationsCollection = collection(this.firestore, 'loan-application');
    const q = query(
      applicationsCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    return from(getDocs(q)).pipe(
      switchMap((querySnapshot) => {
        const applications: SavedApplication[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as SavedApplication;
          applications.push({
            ...data,
            applicationId: docSnap.id
          });
        });
        return from(Promise.resolve(applications));
      }),
      catchError((error) => {
        console.error('Error fetching user applications: ', error);
        return throwError(() => error);
      })
    );
  }

  deleteApplication(applicationId: string): Observable<void> {
    const docRef = doc(this.firestore, `loan-application/${applicationId}`);
    return from(deleteDoc(docRef)).pipe(
      catchError((error) => {
        console.error('Error deleting application: ', error);
        return throwError(() => error);
      })
    );
  }
}