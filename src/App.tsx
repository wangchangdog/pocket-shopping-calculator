import { ShoppingProvider } from "@/context/ShoppingContext";
import { AppRouter } from "@/router";

function App() {
  return (
    <ShoppingProvider>
      <AppRouter />
    </ShoppingProvider>
  );
}

export default App;
