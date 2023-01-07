export const depositConfirmedTemplate = `
<html lang="en">
<body style="font-family: verdana sans-serif;">
    <div class="card m-5">
        <div class="card-body">
            <div class="card-heading mb-3">
                <h3 class="card-title">Deposit Confirmation</h3>
            </div>
            <h5>Hi <<USER>>,</h5>
            <div>
                <p>Your deposit has successfully been completed. Below are the details of your Investment:</p>
                <div class="card border-left">
                    <div class="card-body">
                        <div class="row">
                            Investment Amount: $<<AMOUNT>>
                        </div>
                        <div class="row">
                            Payment Method: <<METHOD>>
                        </div>
                        <div class="row">
                            Investment Plan: <<PLAN>>
                        </div>
                        <div class="row">
                            Investment Type: <<PACKAGE>>
                        </div>
                        <div class="row">
                            ROI: <<ROI>>% daily
                        </div>
                        <div class="row">
                            Duration: 7 days
                        </div>
                    </div>
                </div>
                <p>Best Regards,</p>
                <p>Marstrade</p>
            </div>
        </div>
    </div>
</body>
</html>`

export const depositNotifyTemplate = `
<html lang="en">
<body style="font-family: verdana sans-serif;">
    <div class="card m-5">
        <div class="card-body">
            <div class="card-heading mb-3">
                <h3 class="card-title">Deposit Notification</h3>
            </div>
            <h5>Dear <<USER>>,</h5>
            <div>
                <p>A user just made a deposit. Detail of their investment plan is shown below:</p>
                <div class="card border-left">
                    <div class="card-body">
                        <div class="row">
                            Investment Amount: $<<AMOUNT>>
                        </div>
                        <div class="row">
                            Payment Method: <<METHOD>>
                        </div>
                        <div class="row">
                            Investment Plan: <<PLAN>>
                        </div>
                        <div class="row">
                            Investment Type: <<PACKAGE>>
                        </div>
                        <div class="row">
                            ROI: <<ROI>>% daily
                        </div>
                        <div class="row">
                            Duration: 7 days
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`