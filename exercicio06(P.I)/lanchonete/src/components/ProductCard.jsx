import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ProductCard = ({ name, description, price, category, available }) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-1">
      <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <div className="text-6xl">🍔</div>
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{name}</CardTitle>
          <Badge variant="secondary" className="shrink-0">{category}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center justify-between pt-0">
        <span className="text-2xl font-bold text-primary">
          R$ {price.toFixed(2)}
        </span>
        {!available && (
          <Badge variant="destructive">Indisponível</Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
