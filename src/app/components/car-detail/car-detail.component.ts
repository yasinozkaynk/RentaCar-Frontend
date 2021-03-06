import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder,FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { LoginGuard } from 'src/app/guards/login.guard';
import { Car } from 'src/app/models/car';
import { CarDto } from 'src/app/models/carDto';
import { CustomerDto } from 'src/app/models/customerdto';
import { Findex } from 'src/app/models/findex';
import { Rental } from 'src/app/models/rental';
import { RentalDto } from 'src/app/models/rentaldto';
import { AuthService } from 'src/app/serviices/auth.service';
import { CarDetailService } from 'src/app/serviices/car-detail.service';
import { CarRentalService } from 'src/app/serviices/car-rental.service';
import { CustomerService } from 'src/app/serviices/customer.service';
import { FindexService } from 'src/app/serviices/findex.service';
import { PaymentService } from 'src/app/serviices/payment.service';
import { PaymentComponent } from '../payment/payment.component';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css'],
})
export class CarDetailComponent implements OnInit {
  cars: Car[] = [];
  rentals: Rental[] = [];
  rentalDtos: RentalDto[] = [];
  customers: CustomerDto[] = [];
  rental: Rental;
  findex:Findex[]=[]
  userfindex:number

  customerId: Number;
  customerName: string;
  companyName: string;
  customerEmail: string;
  rentDate!: Date;
  returnDate!: Date;
  carName!:string;
  carDailyPrice: number;
  amountPaye: number = 0;
  carId: number;
  carBrandName: string;
  carModelName: string;
  constructor(
    private cardetailService: CarDetailService,
    private toastrService: ToastrService,
    private customerService: CustomerService,
    private paymentService:PaymentService,
    private rentalService:CarRentalService,
    private activatedRoute:ActivatedRoute,
    private router: Router,
    private authService:AuthService,
    private findexService:FindexService

  ) {}

  carRentalAddForm:FormGroup

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (params['carId']) {
        this.getCar(params['carId']);
      }
    });
    this.getAllCustomers();
    this.findexByUserId(this.authService.userId)
    var myModal = document.getElementById('exampleModalw')
    var myInput = document.getElementById('myInput')
    
    myModal.addEventListener('shown.bs.modal', function () {
      myInput.focus()
    })
    this.isAuthenticated();
  }
  isAuthenticated(){
    if(this.authService.isAuthenticated()){
      return true
    }
    else{
      return false
    }
   }
  findexByUserId(userId:number){
    this.findexService.getFindexScoreByUserId(userId).subscribe(response=>{
      this.findex=response.data 
        })
       }
  checkFindex(){
    if((this.cars[0]?.minFindexScore)<=(this.findex[0]?.findexScore)){
      return true
   }
    else{
      return false}
   }  
  getCar(carId: number) {
    this.cardetailService.carDetail(carId).subscribe((response) => {
      this.cars = response.data;
    });
  }
  getAllCustomers() {
    this.customerService.getCustomerDto().subscribe((response) => {
      this.customers = response.data;
    });
  }

  
  createRentalRequest(car: Car) {
    if (this.customerId === undefined) {
      this.toastrService.warning('M????teri bilgisini kontrol ediniz.');
    } else if (this.rentDate === undefined || !this.rentDate) {
      this.toastrService.warning('Al???? Tarihi bilgisini kontrol ediniz.');
    } else if (this.returnDate === undefined || !this.returnDate) {
      this.toastrService.warning('Teslim Tarihi bilgisini kontrol ediniz.');
    } else if (this.returnDate == this.rentDate) {
      this.toastrService.error('Kiralama Tarihi ve Teslim Tarihi ayn?? olamaz.');
    } else {
      this.toastrService.info('Bilgileriniz kontrol ediliyor.');

      this.carId = car.carId;
      this.carBrandName = car.carName;
      this.carDailyPrice = car.dailyPrice;

      let carToBeRented: Rental = {
        carId: this.carId,
        customerId: parseInt(this.customerId.toString()),
        rentDate: this.rentDate,
        returnDate: this.returnDate,
      };

      this.rentalService.checkCarStatus(carToBeRented).subscribe(
        (response) => {
          this.toastrService.success(response.message,'Tarihler Uygun');
          var carBrandName= this.carBrandName.toString();
          var date1 = new Date(this.returnDate.toString());
          var date2 = new Date(this.rentDate.toString());
          var difference = date1.getTime() - date2.getTime();
          var numberOfDays = Math.ceil(difference / (1000 * 3600 * 24));
          this.amountPaye = numberOfDays * this.carDailyPrice;
          if (this.amountPaye <= 0) {
            this.router.navigate(['/cardetails/' + this.carId]);
            this.toastrService.error('Ara?? listesine y??nlendiriliyorsunuz','Hatal?? i??lem');
          } 
          else {
            this.paymentService.setRental(carToBeRented, this.amountPaye);

            setTimeout(() => {
              this.toastrService.success('Bilgileriniz onayland??.');
            }, 1000);

            setTimeout(() => {
              this.toastrService.info('??deme sayfas??na y??nlendiriliyorsunuz...','??deme ????lemleri');
            }, 1000);

            setTimeout(() => {
              this.router.navigate(['/payments']);
            }, 3000);
          }
        },
        (error) => {
          this.toastrService.error('The car cannot be rented on the requested dates.','Kiralama Ba??ar??s??z');
        }
      );
    }
  }

}
