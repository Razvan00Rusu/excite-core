from collections import OrderedDict
import re
import matplotlib.pyplot as plt

train_loss = OrderedDict(())
val_loss = OrderedDict(())

pattern = r"/.*batch"

with open('./m_cb.txt', 'r') as file:
    for line in file:
        if (len(line) < 36):
            print("skip")
            continue
        log = line[36:].strip() 
        if (log.startswith("Train epoch")):
            colon = log.index(":")
            bracket = log.index("(")
            loss = float(log[colon+1:bracket])
            match = re.search(pattern, log)
            if not match:
                continue
            
            end_epoch = match.start()
            start_epoch = log.index("epoch")+5
            epoch = int(log[start_epoch:end_epoch])
            if epoch in train_loss:
                train_loss[epoch].append(loss)
            else:
                train_loss[epoch] = [loss]

        if (log.startswith("Val epoch")):
            colon = log.index(":")
            bracket = log.index("(")
            loss = float(log[colon+1:bracket])
            match = re.search(pattern, log)
            
            if not match:
                continue
            
            end_epoch = match.start()
            start_epoch = log.index("epoch")+5
            epoch = int(log[start_epoch:end_epoch])

            if epoch in val_loss:
                val_loss[epoch].append(loss)
            else:
                val_loss[epoch] = [loss]

train_loss_arr = []
val_loss_arr = []

for key, array in train_loss.items():
    average = sum(array) / len(array)
    train_loss_arr.append(average)
    print(f"Train Epoch: {key}, Average Loss: {average}")

for key, array in val_loss.items():
    average = sum(array) / len(array)
    val_loss_arr.append(average)
    print(f"Val Epoch: {key}, Average Loss: {average}")

x = range(1, len(train_loss_arr) + 1)

plt.plot(x, train_loss_arr, label="Training Loss")
plt.plot(x, val_loss_arr, label="Validation Loss")
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('Line Chart')
plt.legend()
plt.show()