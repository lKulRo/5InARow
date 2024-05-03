namespace _5InARow.Model;

public class Group
{
    public required string GroupName { get; set; }
    public List<Client> Clients { get; } = new List<Client>();

    public string[,] Board { get; set; } = new string[30, 30];

    public Boolean Player1Turn { get; set; } = true;
}
