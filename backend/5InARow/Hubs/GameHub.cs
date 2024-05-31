using _5InARow.Helper;
using _5InARow.Model;
using Microsoft.AspNetCore.SignalR;

namespace _5InARow.Hubs;

public class GameHub : Hub
{
    private static readonly List<Group> groups = [];
    private static readonly List<Client> clients = [];

    public async Task RemoveFromGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

        await Clients.Group(groupName).SendAsync("Send", $"{Context.ConnectionId} has left the group {groupName}.");
    }

    public async Task GetGroups()
    {
        var filteredGroups = groups.FindAll(group => group.Clients.Count() < 2);
        await Clients.All.SendAsync("GetGroups", filteredGroups.ToArray());
    }

    public async Task RegisterClient(string username)
    {
        Client? client = clients.Find(x => x.ConnectionId == Context.ConnectionId);
        if (client == null)
        {
            client = new Client { ConnectionId = Context.ConnectionId, Username = username };
            clients.Add(client);
        }
        client.Username = username;
        await Clients.Caller.SendAsync("clientJoined", username);
    }

    public async Task RegisterGroup(string groupName)
    {
        //registerd user
        Client? client = clients.Find(x => x.ConnectionId == Context.ConnectionId);
        //registerd groups
        Group? group = groups.Find(x => x.GroupName == groupName);
        //Create new Group if group dont exist and user exist
        if (group == null)
        {
            if (client != null)
            {
                group = new() { GroupName = groupName };
                group.Clients.Add(client);
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
                groups.Add(group);
            }
        }
        //Add existing user to existing group, if he isnt already in it
        else
        {
            var userInGroup = group.Clients.Find(x => x.ConnectionId == Context.ConnectionId);
            if (client != null && userInGroup == null)
            {
                group.Clients.Add(client);
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            }
        }
        await GetGroups();
    }

    public async Task StartGame(string groupname)
    {
        Group? group = groups.Find(x => x.GroupName == groupname);
        if (group != null && group.Clients.Count() == 2)
        {
            await Clients.All.SendAsync("BoardInit", group.Board);
        }
        else
        {
            await Clients.All.SendAsync("NotEnoughPLayer");
        }
    }

    public async Task RestartGame(string groupname)
    {
        Group? group = groups.Find(x => x.GroupName == groupname);
        if (group != null)
        {
            group.Board = new string[30, 30];
            await Clients.All.SendAsync("BoardInit", group.Board);
        }
    }

    public async Task PlacePiece(int x_boardField, int y_boardField, string groupName)
    {
        Group? group = groups.SingleOrDefault(x => x.GroupName == groupName);
        if (group != null)
        {
            var player1 = group.Clients[0].ConnectionId == Context.ConnectionId;
            var player2 = group.Clients[1].ConnectionId == Context.ConnectionId;
            if (player1 && group.Player1Turn)
            {
                group.Board[y_boardField, x_boardField] = "X";
                group.Player1Turn = !group.Player1Turn;
                await Clients.All.SendAsync("PiecePlaced", x_boardField, y_boardField, "X", group.Player1Turn);
                if (CalcWinner(group, x_boardField, y_boardField)) await Clients.All.SendAsync($"Winner", group.Clients[0].Username);
                Console.WriteLine("wtf why ???");
            }
            if (!(!player2 || group.Player1Turn))
            {
                group.Board[y_boardField, x_boardField] = "O";
                group.Player1Turn = !group.Player1Turn;
                await Clients.All.SendAsync("PiecePlaced", x_boardField, y_boardField, "O", group.Player1Turn);
                if (CalcWinner(group, x_boardField, y_boardField)) await Clients.All.SendAsync($"Winner", group.Clients[1].Username);
                Console.WriteLine("wtf why ???");
            }
        }
        
    }
    private bool CalcWinner(Group group, int x, int y)
    {
        return CheckRow(group.Board, x, y) || CheckColumn(group.Board, x, y) || CheckLRDiagonal(group.Board, x, y) || CheckRLDiagonal(group.Board, x, y);
    }
    private bool CheckRow(string[,] board, int x, int y)
    {
        var count = 1;
        var direction = true;
        for (var i = 1; i < 5; i++)
        {
            if (direction && board.GetLength(1) > x + i)
            {
                if (board[y, x] != board[y, x + i])
                {
                    direction = false;
                    i--;
                }
            }
            else
            {
                direction = false;
                if (x - count >= 0)
                {
                    if (board[y, x] == board[y, x - count])
                    {
                        count++;
                    }
                    else
                    {
                        return false;
                    }
                }
                else { return false; }

            }
        }
        return true;
    }

    private bool CheckColumn(string[,] board, int x, int y)
    {
        var count = 1;
        var direction = true;
        for (var i = 1; i < 5; i++)
        {
            if (direction && board.GetLength(0) > y + i)
            {
                if (board[y, x] != board[y + i, x])
                {
                    direction = false;
                    i--;
                }
            }
            else
            {
                direction = false;
                if (y - count >= 0)
                {
                    if (board[y, x] == board[y - count, x])
                    {
                        count++;
                    }
                    else
                    {
                        return false;
                    }
                }
                else { return false; }

            }
        }
        return true;
    }

    private bool CheckLRDiagonal(string[,] board, int x, int y)
    {
        var count = 1;
        var direction = true;
        for (var i = 1; i < 5; i++)
        {
            if (direction && board.GetLength(0) > y + i && board.GetLength(1) > x + i)
            {
                if (board[y, x] != board[y + i, x + i])
                {
                    direction = false;
                    i--;
                }
            }
            else
            {
                direction = false;
                if (y - count >= 0 && x - count >= 0)
                {
                    if (board[y, x] == board[y - count, x - count])
                    {
                        count++;
                    }
                    else
                    {
                        return false;
                    }
                }
                else { return false; }

            }
        }
        return true;
    }
    private bool CheckRLDiagonal(string[,] board, int x, int y)
    {
        var count = 1;
        var direction = true;
        for (var i = 1; i < 5; i++)
        {
            if (direction && board.GetLength(0) > y + i && x - i >= 0)
            {
                if (board[y, x] != board[y + i, x - i])
                {
                    direction = false;
                    i--;
                }
            }
            else
            {
                direction = false;
                if (y - count >= 0 && x + count < board.GetLength(1))
                {
                    if (board[y, x] == board[y - count, x + count])
                    {
                        count++;
                    }
                    else
                    {
                        return false;
                    }
                }
                else { return false; }

            }
        }
        return true;
    }
}





